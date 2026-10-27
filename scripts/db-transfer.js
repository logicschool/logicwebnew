'use strict';
require('dotenv').config({quiet:true});
const fs=require('fs'),path=require('path');
const {connect}=require('../server/services/db');
const tables=['global_settings','admin_users','blog_posts','result_categories','results','programs','branches','placement_posters','banners','recorded_classes','website_content','contact_submissions','media_files'];
const file=path.resolve(process.argv[3]||'data/postgres-export.json');
(async()=>{
 let db,client;
 try {
  db=await connect();
  if(process.argv[2]==='export'){
   const data={format:'logic-postgres-export-v1',tables:{}};
   for(const table of tables)data.tables[table]=(await db.query('SELECT * FROM '+table)).rows;
   fs.writeFileSync(file,JSON.stringify(data,null,2)+'\n',{flag:'wx',mode:0o600});
   console.log('Exported saved CMS data and account hashes. Keep this file private.');
  } else if(process.argv[2]==='import') {
   if(!db.postgres)throw Error('Import requires the target PostgreSQL connection in .env.');
   const data=JSON.parse(fs.readFileSync(file,'utf8'));
   if(data.tables)for(const t of ['recorded_classes','website_content'])if(data.tables[t]===undefined)data.tables[t]=[];
   if(data.format!=='logic-postgres-export-v1'||!data.tables||tables.some(t=>!Array.isArray(data.tables[t])))throw Error('Invalid database export.');
   await db.migrate();client=await db.raw.connect();await client.query('BEGIN');
   await client.query('LOCK TABLE '+tables.join(',')+' IN ACCESS EXCLUSIVE MODE');
   for(const table of tables)if((await client.query('SELECT 1 FROM '+table+' LIMIT 1')).rowCount)throw Error('Target database must be empty. Do not run migrate/start before import. Existing records were not changed.');
   for(const table of tables){
    const columns=(await client.query('SELECT column_name,data_type FROM information_schema.columns WHERE table_schema=$1 AND table_name=$2',['public',table])).rows;
    for(const row of data.tables[table]){
     const keys=Object.keys(row);if(!keys.length||keys.some(k=>!columns.some(c=>c.column_name===k)))throw Error('Unexpected columns in '+table);
     const values=keys.map(k=>['json','jsonb'].includes(columns.find(c=>c.column_name===k).data_type)?JSON.stringify(row[k]):row[k]);
     await client.query('INSERT INTO '+table+' ('+keys.map(k=>'"'+k+'"').join(',')+') VALUES ('+keys.map((_,i)=>'$'+(i+1)).join(',')+')',values);
    }
   }
   await client.query('COMMIT');console.log('PostgreSQL import complete. Existing sessions are intentionally not transferred.');
  } else throw Error('Use npm run db:export -- file.json or npm run db:import -- file.json');
 } catch(err) {if(client)await client.query('ROLLBACK');throw err;}
 finally {if(client)client.release();if(db)await db.close();}
})().catch(err=>{console.error(err.message);process.exitCode=1;});
