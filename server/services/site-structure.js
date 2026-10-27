'use strict';
const fs=require('fs'),path=require('path'),cheerio=require('cheerio');
const {esc}=require('./content'),schemas=require('./site-content-schema');
const merged={
 '/affiliations':'/about#affiliations','/logic-updates':'/about#awards','/asap-collaboration':'/about#asap',
 '/hiring-partners':'/placements#hiring-partners','/skill-development':'/placements#skill-development','/placement-assistance':'/placements#placement-assistance','/health-wellness':'/life-at-logic#health-wellness'
};
const mainLinks=[{label:'Courses',url:'/courses'},{label:'Results',url:'/results'},{label:'Placements',url:'/placements'},{label:'Recorded Classes',url:'/recorded-classes'},{label:'About',url:'/about'},{label:'Contact',url:'/contact'}];
const courseLinks=[{label:'All Courses',url:'/courses'},{label:'Batch Schedule',url:'/batches'},{label:'Career Test',url:'/career-test'},{label:'Admissions',url:'/admissions'},{label:'Make Payment',url:'https://epay.logiceducation.org/'}];
const aboutLinks=[{label:'About Logic',url:'/about'},{label:'Life @ Logic',url:'/life-at-logic'},{label:'Blog',url:'/blog'},{label:'Student Testimonials',url:'/testimonials'},{label:'Branches',url:'/branches'}];
const footerLinks=[{label:'About Logic',url:'/about'},{label:'Contact',url:'/contact'},{label:'Branches',url:'/branches'},{label:'Recruit Our Talent',url:'/recruit-our-talent'},{label:'Join Our Team',url:'/careers'},{label:'Make Payment',url:'https://epay.logiceducation.org/'}];
async function seed(db){
 if(await db.get('global_settings','website-audit-v1'))return;
 const settings=await db.get('global_settings','site');
 await db.put('global_settings','website-audit-navigation-backup-v1',{navigation:settings.navigation,header:settings.header,footer:settings.footer});
 const canonical=require('./public-urls').canonicalPath;
 const known=new Set([...mainLinks,...courseLinks,...aboutLinks,...footerLinks].map(x=>x.url).concat(Object.keys(merged),['/explore','/meet-the-team','/']));
 const custom=[...(settings.navigation||[]),...(settings.header?.moreLinks||[])].filter(x=>!known.has(canonical(x.url)||x.url));
 const unique=a=>a.filter((x,i)=>a.findIndex(y=>y.url===x.url)===i);
 settings.navigation=mainLinks;settings.header={...settings.header,courseLinks,aboutLinks,moreLinks:unique(custom)};
 const oldFooter=(settings.footer?.quickLinks||[]).filter(x=>!known.has(canonical(x.url)||x.url));settings.footer={...settings.footer,quickLinks:unique([...footerLinks,...oldFooter])};
 await db.put('global_settings','site',settings);
 // Add useful CA guidance only to default/empty copy; preserve owner-authored text.
 for(const [kind,body]of Object.entries(require('./ca-guidance.json'))){const key='site-page-'+kind,old=await db.get('global_settings',key)||{};if(!old.body)await db.put('global_settings',key,{...old,body});}
 await db.put('global_settings','website-audit-v1',{done:true});
}
async function apply($,db,pathname){
 const clean=require('./public-urls').canonicalPath(pathname);$('[data-audit-generated]').remove();
 if(!['/about','/placements','/life-at-logic','/explore','/courses/ca-foundation','/courses/ca-inter','/courses/ca-final','/courses','/admissions'].includes(clean))return;
 const {card,logo,paragraphs}=require('./site-content');
 if(!$('link[href^="/assets/site-content.css"]').length)$('head').append('<link rel="stylesheet" href="/assets/site-content.css?v=audit-1">');
 const all=(await db.list('website_content')).filter(x=>x.status==='published');
 async function section(kind,id){const rows=all.filter(x=>x.kind===kind),cfg={...schemas[kind].defaults,...await db.get('global_settings','site-page-'+kind)};const logos=['partners','affiliations'].includes(kind);return `<section class="section sc-merged-section" id="${id}" data-audit-generated><div class="container"><div class="section-head"><div><span class="eyebrow">${esc(cfg.eyebrow)}</span><h2>${esc(cfg.title)}</h2><p>${esc(cfg.intro)}</p></div></div>${cfg.body?`<div class="sc-intro">${paragraphs(cfg.body)}</div>`:''}<div class="${logos?'sc-logo-grid':'sc-grid'}" data-section-content="${kind}">${rows.map(d=>logos?logo(d):card(d)).join('')||`<p class="sc-empty">${esc(cfg.emptyText)}</p>`}</div>${cfg.url&&cfg.buttonText?`<div class="sc-cta"><a class="btn btn-green" href="${esc(cfg.url)}">${esc(cfg.buttonText)}</a></div>`:''}</div></section>`;}
 if(clean==='/about'){
  $('main').append(await section('affiliations','affiliations'),await section('updates','awards'),await section('asap','asap'));
  $('main').append(`<section class="section" id="team-contact" data-audit-generated><div class="container"><div class="career-banner"><div><b>Connect with the Logic team.</b><span>Find your campus or speak with admissions.</span></div><a class="btn btn-green" href="/contact">Contact Logic</a>${all.some(x=>x.kind==='team')?'<a class="btn btn-outline" href="/meet-the-team">Meet our team</a>':''}</div></div></section>`);
 }
 if(clean==='/placements'){
  $('.premium-resource-banner span').text('Tell us your course, current status and preferred location using the assistance form below.');
  $('main').append(await section('partners','hiring-partners'),await section('skills','skill-development'));
  const {root}=require('./db'),source=cheerio.load(fs.readFileSync(path.join(root,'placement-assistance.html'),'utf8'));
  const block=source('main').first();block.find('form[data-form]').each((i,e)=>{const f=source(e);if(!f.find('[name=source]').length)f.append('<input type="hidden" name="source" value="Website Placement Assistance">');});
  // The original file remains the editable source for this form, preserving local edits.
  $('main').append(`<div id="placement-assistance" data-audit-generated>${block.html()||''}</div><section class="section" data-audit-generated><div class="container"><div class="career-banner"><div><b>Looking to hire?</b><span>Connect with Logic’s placement team about your recruitment needs.</span></div><a class="btn btn-green" href="/recruit-our-talent">Recruit Our Talent</a></div></div></section>`);
 }
 if(clean==='/life-at-logic')$('main').append(await section('wellness','health-wellness'));
 if(clean==='/explore'){
  const seen=new Set();$('main .sc-card').each((i,e)=>{const a=$(e).find('a').first(),old=a.attr('href'),dest=require('./public-urls').resolveHref(old,'/explore','https://logic.invalid');if(old==='/meet-the-team'&&!all.some(x=>x.kind==='team')){$(e).remove();return;}if(seen.has(dest)){$(e).remove();return;}seen.add(dest);a.attr('href',dest);});
  if(!$('meta[name=robots]').length)$('head').append('<meta name="robots" content="noindex,follow">');
 }
 if(clean==='/courses'||clean==='/admissions'){
  $('main').append('<section class="section" data-audit-generated><div class="container"><div class="career-banner"><div><b>Still choosing your course?</b><span>Explore a course direction with six short questions.</span></div><a class="btn btn-green" href="/career-test">Take the Career Test</a></div></div></section>');
 }
 if(/^\/courses\/ca-(foundation|inter|final)$/.test(clean)){
  $('main .sc-info').first().append(' <a href="https://icai-call-sahayata.icai.org/wp-content/uploads/2024/10/CA-Courses-.pdf">Read ICAI’s course eligibility FAQs (PDF)</a>.');
  const kind=clean.slice('/courses/'.length),name=schemas[kind].label,matched=all.filter(x=>x.kind==='batches'&&x.title.toLowerCase().includes(name==='CA Intermediate'?'ca inter':name.toLowerCase()));
  const bat=matched.length?matched.map(d=>`<article class="sc-card"><div class="sc-card-body"><span class="eyebrow">${esc(d.mode)}</span><h3>${esc(d.title)}</h3><p>${esc(d.branch)} · ${esc(d.schedule)}<br>${esc(d.time)}</p><a class="text-button" href="/admissions?course=${encodeURIComponent(name)}">Confirm this batch →</a></div></article>`).join(''):'<p class="sc-empty">Ask admissions about the next '+esc(name)+' intake and available learning modes.</p>';
  $('main').append(`<section class="section" data-audit-generated><div class="container"><div class="section-head"><div><span class="eyebrow">PLAN YOUR NEXT STEP</span><h2>Batch options & admissions</h2><p>Confirm current dates, class timings, fees and preparation support with the Logic team.</p></div></div><div class="sc-grid">${bat}</div></div></section><section class="section sc-form-section" id="course-enquiry" data-audit-generated><div class="container"><h2>Enquire about ${esc(name)}</h2><form class="contact-form" data-form="enquiry"><input name="source" type="hidden" value="Website ${esc(name)}"><input name="course" type="hidden" value="${esc(name)}"><label>NAME<input name="name" required autocomplete="name"></label><label>PHONE<input name="phone" type="tel" required autocomplete="tel"></label><label>EMAIL<input name="email" type="email" autocomplete="email"></label><label>PREFERRED LEARNING MODE<select name="mode"><option>Discuss available options</option><option>Classroom</option><option>Online</option><option>Recorded classes</option></select></label><label>YOUR QUESTION<textarea name="message" rows="4" placeholder="Ask about fees, batches or your preparation plan"></textarea></label><button class="btn btn-yellow" type="submit">Request course guidance</button></form></div></section>`);
  $('.page-hero .container').append('<div class="sc-cta" data-audit-generated><a class="btn btn-yellow" href="#course-enquiry">Enquire Now →</a></div>');
 }
}
module.exports={merged,mainLinks,courseLinks,aboutLinks,footerLinks,seed,apply};
