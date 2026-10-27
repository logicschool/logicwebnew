'use strict';
// Preserve the original HTML, CSS, JS and media byte-for-byte.
const fs = require('fs');
const path = require('path');
const {execFileSync} = require('child_process');
const root = path.resolve(__dirname, '..');
const out = path.join(root, 'dist');
const stage = path.join(root, '.build-stage');
const directories = ['server', 'scripts', 'admin', 'assets', 'courses', 'partials', 'uploads', 'deploy'];
function walk(dir) {
  return fs.readdirSync(dir, {withFileTypes:true}).flatMap(e => {
    const p = path.join(dir,e.name);
    if(e.isSymbolicLink()) throw Error('Build does not accept symlinks: '+p);
    return e.isDirectory() ? walk(p) : [p];
  });
}
try {
  // Fail before replacing any previous build when source syntax is invalid.
  for(const dir of ['server','scripts','admin','assets']) {
    for(const file of walk(path.join(root,dir)).filter(p=>p.endsWith('.js'))) execFileSync(process.execPath,['--check',file],{stdio:'pipe'});
  }
  execFileSync(process.execPath,['--check',path.join(root,'server.js')],{stdio:'pipe'});
  for(const file of ['data/site-settings.json','data/content-seed.json','package.json','package-lock.json']) JSON.parse(fs.readFileSync(path.join(root,file),'utf8'));
  // Refuse to erase a folder that has been configured or used as a live CMS.
  if(fs.existsSync(path.join(out,'.env')) || fs.existsSync(path.join(out,'data/backups')) || fs.existsSync(path.join(out,'data/dev-db'))) throw Error('dist has runtime data or .env. Back it up and move it before rebuilding; never build over a running CMS.');
  fs.rmSync(stage,{recursive:true,force:true});fs.mkdirSync(stage,{recursive:true});
  for(const dir of directories) fs.cpSync(path.join(root,dir),path.join(stage,dir),{recursive:true});
  for(const e of fs.readdirSync(root,{withFileTypes:true})) if(e.isFile() && (/\.(html|md)$/.test(e.name) || ['server.js','package.json','package-lock.json','.env.example','robots.txt','sitemap.xml','update-manifest.json','UPDATE-WINDOWS.cmd'].includes(e.name))) fs.copyFileSync(path.join(root,e.name),path.join(stage,e.name));
  fs.mkdirSync(path.join(stage,'data'),{recursive:true});
  // Local configuration/logs and the embedded database are not production build inputs.
  for(const name of ['site-settings.json','content-seed.json']) fs.copyFileSync(path.join(root,'data',name),path.join(stage,'data',name));
  const count=walk(stage).length;
  fs.writeFileSync(path.join(stage,'BUILD-INFO.json'),JSON.stringify({builtAt:new Date().toISOString(),node:process.version,files:count,entry:'server/app.js',database:'PostgreSQL'},null,2)+'\n');
  fs.rmSync(out,{recursive:true,force:true});fs.renameSync(stage,out);
  console.log('Build complete: dist/ ('+count+' files). Deploy the complete folder with Node.js and PostgreSQL.');
} catch(err) {
  fs.rmSync(stage,{recursive:true,force:true});console.error('Build failed:',err.message);process.exitCode=1;
}
