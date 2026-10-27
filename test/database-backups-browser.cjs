const {chromium}=require('playwright'),http=require('node:http'),fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
(async()=>{
 const root=path.resolve(__dirname,'..'),server=http.createServer((req,res)=>{const p=path.join(root,new URL(req.url,'http://localhost').pathname);res.setHeader('Content-Type',p.endsWith('.js')?'text/javascript':p.endsWith('.css')?'text/css':'text/html');res.end(fs.readFileSync(p));}).listen(0,'127.0.0.1');await new Promise(r=>server.once('listening',r));
 const module=await import('@sparticuz/chromium'),c=module.default,browser=await chromium.launch({executablePath:await c.executablePath(),args:c.args,headless:true});
 try{
 const page=await browser.newPage({viewport:{width:1280,height:900}}),errors=[];page.on('pageerror',e=>errors.push(e.message));let created=false,restored=false;
 await page.route('**/api/admin/**',async route=>{const req=route.request(),url=new URL(req.url());let data;
 if(url.pathname.endsWith('/session'))data={authenticated:true,csrfToken:'test-token'};
 else if(req.method()==='GET')data={postgres:true,backups:created?[{name:'manual-2026-abcdef123456.json',bytes:1024,createdAt:'2026-10-27T00:00:00Z'}]:[]};
 else {const body=req.postDataJSON();assert.equal(body.password,'test-password');assert.equal(req.headers()['x-csrf-token'],'test-token');if(url.pathname.endsWith('/restore')){assert.equal(body.confirmation,'RESTORE');restored=true;data={message:'Database restored. Sign in again.',recovery:'before-restore-test.json'};}else{created=true;data={name:'manual-2026-abcdef123456.json'};}}
 await route.fulfill({json:data});});
 await page.goto('http://127.0.0.1:'+server.address().port+'/admin/database-backups.html');
 await page.waitForFunction(()=>document.querySelector('#status').textContent.includes('PostgreSQL connected'));
 await page.locator('#backupPassword').fill('test-password');await page.getByRole('button',{name:'Create database backup'}).click();await page.getByRole('link',{name:'Download',exact:true}).waitFor();
 await page.locator('#backupFile').setInputFiles({name:'backup.json',mimeType:'application/json',buffer:Buffer.from('{}')});await page.locator('#restorePassword').fill('test-password');await page.locator('#confirmation').fill('RESTORE');page.once('dialog',d=>d.accept());await page.getByRole('button',{name:'Restore database',exact:true}).click();await page.getByRole('link',{name:'Sign in to the CMS'}).waitFor();assert.ok(restored);assert.equal(await page.getByRole('button',{name:'Restore database',exact:true}).isDisabled(),true);
 await page.setViewportSize({width:390,height:844});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await page.screenshot({path:process.env.BACKUP_SCREENSHOT||'/tmp/logic-database-backups.png',fullPage:true});assert.deepEqual(errors,[]);console.log('Backup creation, restore confirmation, session-expiry UI and mobile layout passed (mock API).');
 }finally{await browser.close();await new Promise(r=>server.close(r));}
})().catch(e=>{console.error(e);process.exitCode=1;});
