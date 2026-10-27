'use strict';
const fs=require('fs'),path=require('path');
const out=path.resolve(__dirname,'../dist');
if(!fs.existsSync(path.join(out,'server/app.js')))throw Error('Run npm run build first.');
process.chdir(out);
require(path.join(out,'server/app.js')).start().catch(err=>{console.error(err.message);process.exitCode=1;});
