const fs=require('fs'),os=require('os'),path=require('path'),crypto=require('crypto'),assert=require('node:assert/strict');
(async()=>{
 Object.assign(process.env,{NODE_ENV:'development',DEV_DATABASE:'pglite',DEV_DATABASE_DIR:fs.mkdtempSync(path.join(os.tmpdir(),'logic-posters-')),SESSION_SECRET:crypto.randomBytes(32).toString('hex'),TOTP_ENCRYPTION_KEY:crypto.randomBytes(32).toString('hex'),PORT:'0'});
 delete process.env.DATABASE_URL;delete process.env.PGHOST;delete process.env.PUBLIC_ORIGIN;
 const {server,db}=await require('../dist/server/app').start();const base='http://127.0.0.1:'+server.address().port;
 const {chromium}=require('playwright'),binary=require('@sparticuz/chromium').default;
 let browser;const errors=[];const checks=[];
 try{
  const input={categoryId:'ca',image:'/assets/images/result-poster-1.svg',status:'published'};
  const validated=require('../dist/server/services/content').validate('results',input);await db.put('results','poster-without-title',validated);
  await db.put('results','poster-with-title',{...input,image:'/assets/images/result-poster-2.svg',title:'Hidden title',studentName:'Hidden student',level:'Hidden level',rank:'1',examSession:'Hidden session',year:'2026'});
  db.cache.results=await db.list('results');
  db.cache.banners=[{id:'qa-banner',page:'results',categoryId:'ca',image:input.image,title:'Banner alt',caption:'Hidden caption'}];
  browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH||await binary.executablePath(),args:binary.args});
  const page=await browser.newPage({reducedMotion:'reduce'});page.on('pageerror',e=>errors.push(e.message));
  await page.route('**/*',route=>{if(new URL(route.request().url()).origin!==base)route.abort();else route.continue()});
  fs.mkdirSync(path.resolve(__dirname,'../verification'),{recursive:true});
  for(const width of [1440,390]){
   await page.setViewportSize({width,height:900});await page.goto(base+'/results/ca',{waitUntil:'networkidle'});
   assert.equal(await page.locator('main .result-poster-copy,main h1,main h2,main figcaption').count(),0);
   assert.ok(await page.locator('main [data-image-lightbox]').count()>=2);
   assert.ok((await page.locator('main .result-poster-grid').innerText()).trim()==='');
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+2));
   await page.screenshot({path:path.resolve(__dirname,'../verification/result-posters-'+width+'.png'),fullPage:true});
   await page.locator('[data-image-lightbox]').first().click();await page.locator('.image-lightbox.open').waitFor();await page.keyboard.press('Escape');assert.equal(await page.locator('.image-lightbox.open').count(),0);
   checks.push({width,posterOnly:true,noOverflow:true,lightbox:true});
  }
  for(const route of ['/','/about','/courses/ca','/results','/placements','/admin/','/api/health'])assert.equal((await fetch(base+route)).status,200,route);
  const redir=await fetch(base+'/results/ca.html?source=qa',{redirect:'manual'});assert.equal(redir.status,301);assert.equal(redir.headers.get('location'),'/results/ca?source=qa');
  assert.deepEqual(errors,[]);
  fs.writeFileSync(path.resolve(__dirname,'../verification/posters-browser.json'),JSON.stringify({runtime:'built dist using isolated PGlite test database',checks,errors,cleanUrlRedirect:true,smokeRoutes:7},null,2));console.log('Built app verified: desktop/mobile posters, no captions, lightbox, 7 routes and clean URL redirect.');
 }finally{if(browser)await browser.close();await new Promise(r=>server.close(r));await db.close();fs.rmSync(process.env.DEV_DATABASE_DIR,{recursive:true,force:true});}
})().catch(e=>{console.error(e);process.exitCode=1});
