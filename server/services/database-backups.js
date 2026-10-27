'use strict';
const fs = require('node:fs/promises');
const path = require('node:path');
const crypto = require('node:crypto');
const TABLES = ['global_settings','admin_users','blog_posts','result_categories','results','programs','branches','placement_posters','banners','recorded_classes','website_content','contact_submissions','media_files','form_dedup_keys'];
const FORMAT = 'logic-cms-database-v1';
const MAX_BYTES = 25 * 1024 * 1024;
const quote = s => '"' + s.replaceAll('"','""') + '"';
const keyId = () => process.env.TOTP_ENCRYPTION_KEY ? crypto.createHash('sha256').update(process.env.TOTP_ENCRYPTION_KEY).digest('hex') : null;
async function schema(client) {
 const out = {};
 for (const table of TABLES) out[table] = (await client.query('SELECT column_name, data_type FROM information_schema.columns WHERE table_schema=$1 AND table_name=$2 ORDER BY ordinal_position',['public',table])).rows;
 return out;
}
async function snapshot(client) {
 const tables = {};
 for (const t of TABLES) tables[t] = (await client.query('SELECT * FROM public.' + quote(t))).rows;
 const backup = {format:FORMAT,createdAt:new Date().toISOString(),schema:await schema(client),totpKeyId:keyId(),tables};
 if(Buffer.byteLength(JSON.stringify(backup)) > MAX_BYTES) throw Error('Database exceeds the 25 MB admin backup limit. Use a server-side PostgreSQL backup.');
 return backup;
}
function validate(backup, currentSchema) {
 if(Buffer.byteLength(JSON.stringify(backup)||'')>MAX_BYTES) throw Error('Maximum backup size is 25 MB.');
 if(!backup || backup.format!==FORMAT || !backup.tables || !backup.schema || Object.keys(backup.tables).length!==TABLES.length) throw Error('Select a Logic CMS database backup created by this page.');
 if(JSON.stringify(backup.schema)!==JSON.stringify(currentSchema)) throw Error('Backup schema does not match this CMS version. Restore using the matching CMS version.');
 for(const t of TABLES) {
  if(!Array.isArray(backup.tables[t])) throw Error('Missing backup table: '+t);
  const columns=currentSchema[t].map(c=>c.column_name).sort();
  for(const row of backup.tables[t]) if(!row || Array.isArray(row) || typeof row!=='object' || JSON.stringify(Object.keys(row).sort())!==JSON.stringify(columns)) throw Error('Invalid backup rows in '+t);
 }
 const users=backup.tables.admin_users;
 if(!users.length || users.some(u=>typeof u.username!=='string'||typeof u.password_hash!=='string'||!/^\$2[aby]\$\d{2}\$/.test(u.password_hash))) throw Error('Backup must contain valid admin accounts.');
 if(users.some(u=>u.totp_secret) && backup.totpKeyId!==keyId()) throw Error('This backup requires the original TOTP_ENCRYPTION_KEY. Set it on the server before restoring.');
 if(!backup.tables.global_settings.some(x=>x.id==='site')) throw Error('Backup is missing the site settings.');
}
function service(db, directory) {
 let busy=false;
 const validName = name => /^(?:manual|before-restore)-[0-9TZ-]+-[a-f0-9]{12}\.json$/.test(name);
 async function save(backup,prefix) {
  await fs.mkdir(directory,{recursive:true,mode:0o700});
  const name=prefix+'-'+new Date().toISOString().replace(/[:.]/g,'-')+'-'+crypto.randomBytes(6).toString('hex')+'.json';
  await fs.writeFile(path.join(directory,name),JSON.stringify(backup),{flag:'wx',mode:0o600});
  return name;
 }
 async function transaction(work, restore=false) {
  if(!db.postgres) throw Error('Database backups require PostgreSQL. Configure DATABASE_URL or PGHOST on the server.');
  if(busy) throw Error('A database backup or restore is already running.');
  busy=true;let client;
  try {
   client=await db.raw.connect();await client.query('BEGIN ISOLATION LEVEL REPEATABLE READ');
   await client.query("SET LOCAL lock_timeout = '15s'");await client.query("SET LOCAL statement_timeout = '120s'");
   if(!(await client.query('SELECT pg_try_advisory_xact_lock(731920126) AS locked')).rows[0].locked) throw Error('A database backup or restore is already running.');
   if(restore) await client.query('LOCK TABLE '+TABLES.map(t=>'public.'+quote(t)).join(',')+' IN ACCESS EXCLUSIVE MODE');
   const result=await work(client);await client.query('COMMIT');return result;
  } catch(e) {if(client) await client.query('ROLLBACK').catch(()=>{});throw e;}
  finally {client?.release();busy=false;}
 }
 return {
  get busy(){return busy;},
  async list(){await fs.mkdir(directory,{recursive:true,mode:0o700});return Promise.all((await fs.readdir(directory)).filter(validName).sort().reverse().map(async name=>{const s=await fs.stat(path.join(directory,name));return {name,bytes:s.size,createdAt:s.mtime.toISOString()};}));},
  file(name){if(!validName(name)) throw Error('Invalid backup filename.');return path.join(directory,name);},
  create(){return transaction(async c=>save(await snapshot(c),'manual'));},
  restore(backup){return transaction(async c=>{
   validate(backup,await schema(c));
   const recovery=await save(await snapshot(c),'before-restore');
   for(const t of [...TABLES].reverse()) await c.query('DELETE FROM public.'+quote(t));
   for(const t of TABLES) {
    const cols=backup.schema[t];
    for(const row of backup.tables[t]) await c.query('INSERT INTO public.'+quote(t)+' ('+cols.map(x=>quote(x.column_name)).join(',')+') VALUES ('+cols.map((_,i)=>'$'+(i+1)).join(',')+')',cols.map(x=>['json','jsonb'].includes(x.data_type)?JSON.stringify(row[x.column_name]):row[x.column_name]));
   }
   await c.query('DELETE FROM public.session');
   return recovery;
  },true)}
 };
}
module.exports={service,validate,snapshot,schema,TABLES,FORMAT,MAX_BYTES};
