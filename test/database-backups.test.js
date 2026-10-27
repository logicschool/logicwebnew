const {test}=require('node:test');
const assert=require('node:assert/strict'),fs=require('node:fs/promises'),path=require('node:path'),os=require('node:os');
const {PGlite}=require('@electric-sql/pglite');
const {service}=require('../server/services/database-backups');
test('database backup round trip, validation, recovery copy and transactional rollback',async()=>{
 const raw=new PGlite(),directory=await fs.mkdtemp(path.join(os.tmpdir(),'logic-backups-'));
 // PGlite runs real PostgreSQL queries, but does not implement advisory locks.
 const query=(sql,args)=>sql.startsWith('SELECT pg_try_advisory_xact_lock')?Promise.resolve({rows:[{locked:true}]}):raw.query(sql,args);
 const db={postgres:true,raw:{connect:async()=>({query,release(){}})}};
 try{
  for(const name of (await fs.readdir(path.join(__dirname,'../server/migrations'))).sort())await raw.exec(await fs.readFile(path.join(__dirname,'../server/migrations',name),'utf8'));
  await query('INSERT INTO admin_users(username,password_hash) VALUES($1,$2)',['admin',await require('bcryptjs').hash('test-only-password',4)]);
  await query('INSERT INTO global_settings(id,data) VALUES($1,$2)',['site',JSON.stringify({siteName:'Original',nested:{value:['a',2]}})]);
  await query('INSERT INTO results(id,data) VALUES($1,$2)',['result',JSON.stringify({status:'draft',title:'Original'})]);
  const svc=service(db,directory), name=await svc.create();const backup=JSON.parse(await fs.readFile(svc.file(name),'utf8'));
  assert.equal(backup.tables.session,undefined);assert.equal(backup.tables.global_settings[0].data.siteName,'Original');
  assert.throws(()=>svc.file('../admin-auth.json'));
  await query("UPDATE global_settings SET data='{}'");
  await query("INSERT INTO session(sid,sess,expire) VALUES('active','{}',now())");
  const recovery=await svc.restore(backup);
  assert.equal((await query('SELECT data FROM global_settings')).rows[0].data.siteName,'Original');
  assert.equal((await query('SELECT * FROM session')).rows.length,0);
  assert.deepEqual(JSON.parse(await fs.readFile(svc.file(recovery),'utf8')).tables.global_settings[0].data,{});
  const invalid=structuredClone(backup);invalid.tables.results.push(invalid.tables.results[0]);
  await assert.rejects(svc.restore(invalid)); // duplicate PK occurs after DELETE; entire transaction must roll back.
  assert.equal((await query('SELECT count(*)::int AS n FROM results')).rows[0].n,1);
  assert.equal((await query('SELECT data FROM global_settings')).rows[0].data.siteName,'Original');
  const missing=structuredClone(backup);delete missing.tables.results;await assert.rejects(svc.restore(missing));
  const schema=structuredClone(backup);schema.schema.results=[];await assert.rejects(svc.restore(schema),/schema/);
  const accounts=structuredClone(backup);accounts.tables.admin_users=[];await assert.rejects(svc.restore(accounts),/admin accounts/);
  const totp=structuredClone(backup);totp.tables.admin_users[0].totp_secret='sealed';totp.totpKeyId='wrong';await assert.rejects(svc.restore(totp),/TOTP_ENCRYPTION_KEY/);
  assert.ok((await svc.list()).length>=3);
  await assert.rejects(service({...db,postgres:false},directory).create(),/PostgreSQL/);
 }finally{await raw.close();await fs.rm(directory,{recursive:true,force:true});}
});
test('backup HTTP routes enforce password, confirmation, and private downloads',async()=>{
 const express=require('express'),app=express(),dir=await fs.mkdtemp(path.join(os.tmpdir(),'logic-backup-api-'));
 app.use((req,res,next)=>{req.adminUser={password_hash:require('bcryptjs').hashSync('test-only-password',4)};next();});
 app.use('/backups',require('../server/routes/database-backups')({postgres:true},dir,async()=>{}));
 const server=app.listen(0,'127.0.0.1');await new Promise(r=>server.once('listening',r));const base='http://127.0.0.1:'+server.address().port;
 try{
  let r=await fetch(base+'/backups');assert.equal(r.headers.get('cache-control'),'no-store');assert.deepEqual((await r.json()).backups,[]);
  r=await fetch(base+'/backups',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({password:'wrong'})});assert.equal(r.status,403);
  r=await fetch(base+'/backups/restore',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({password:'test-only-password',confirmation:'no'})});assert.equal(r.status,400);assert.match((await r.json()).error,/RESTORE/);
  r=await fetch(base+'/backups/not-a-backup.json');assert.equal(r.status,400);
 }finally{await new Promise(r=>server.close(r));await fs.rm(dir,{recursive:true,force:true});}
});
