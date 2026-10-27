'use strict';
const express=require('express'),bcrypt=require('bcryptjs'),path=require('path');
const {rateLimit}=require('express-rate-limit');
const {service}=require('../services/database-backups');
module.exports=function(db,root,refresh){
 const r=express.Router(), backups=service(db,path.join(root,'data/database-backups'));
 r.use((req,res,next)=>{res.set('Cache-Control','no-store');next();});
 r.get('/',async(req,res)=>res.json({ok:true,postgres:db.postgres,busy:backups.busy,backups:await backups.list()}));
 r.get('/:name',async(req,res)=>{let file;try{file=backups.file(req.params.name);}catch{return res.status(400).json({ok:false,error:'Invalid backup filename.'});}res.download(file,req.params.name,err=>{if(err&&!res.headersSent)res.status(404).json({ok:false,error:'Backup not found.'});});});
 r.use(rateLimit({windowMs:15*60*1000,limit:10,standardHeaders:'draft-7',legacyHeaders:false,message:{ok:false,error:'Too many attempts. Try again in 15 minutes.'}}));
 r.use(express.json({limit:'27mb'}));
 r.use(async(req,res,next)=>{
  if(!db.postgres)return res.status(409).json({ok:false,error:'Configure PostgreSQL on the server to use database backups.'});
  if(typeof req.body?.password!=='string'||Buffer.byteLength(req.body.password)>72||!await bcrypt.compare(req.body.password,req.adminUser.password_hash))return res.status(403).json({ok:false,error:'Current admin password is incorrect.'});
  next();
 });
 r.post('/',async(req,res)=>{try{res.json({ok:true,name:await backups.create()});}catch(e){console.error('Database backup failed:',e.code||e.name);res.status(400).json({ok:false,error:e.code?'Database backup failed. Check server storage and database permissions.':e.message});}});
 r.post('/restore',async(req,res)=>{
  if(req.body.confirmation!=='RESTORE')return res.status(400).json({ok:false,error:'Type RESTORE to confirm replacement of the current database records.'});
  let recovery;
  try{recovery=await backups.restore(req.body.backup);}catch(e){console.error('Database restore failed:',e.code||e.name);return res.status(400).json({ok:false,error:e.code?'Restore failed; database changes were rolled back. Check the backup and server logs.':e.message});}
  let warning='';try{await refresh();}catch{warning=' Database restored, but the website cache could not refresh. Restart the CMS.';}
  req.session.destroy(()=>res.clearCookie('logic_admin_session',{path:'/'}).json({ok:true,recovery,message:'Database restored. Sign in using an account from the backup.'+warning}));
 });
 r.use((err,req,res,next)=>{if(err.type==='entity.too.large'||err.type==='entity.parse.failed')return res.status(400).json({ok:false,error:'Invalid JSON or upload too large. Maximum backup size is 25 MB.'});next(err);});
 return r;
};
