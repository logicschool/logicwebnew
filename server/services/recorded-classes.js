'use strict';
const fs=require('fs'),path=require('path'),cheerio=require('cheerio');
const {esc}=require('./content');
const pageDefaults={heading:'Your next chapter.',highlight:'On your schedule.',intro:"Explore recorded classes for your professional course. Choose your subject and continue to Logic's learning platform for demos and purchase details.",catalogueTitle:'Explore recorded classes.',supportTitle:'Find the right class for you.',supportText:'Contact our team for course guidance, purchase assistance and class updates.',supportPhone:'93565 77077',loginUrl:'https://logiceducation.testpress.in/',footerTitle:"Let's find your next step.",footerText:'Our team can help with course selection and questions about recorded classes.',purchaseNote:"Demo / Buy Now takes you to Logic's Testpress learning platform. Sign in or register there to check the current price, syllabus, access period and purchase options."};
function text(value,max=500){if(value!==undefined&&typeof value!=='string')throw Error('Text fields must contain text');const s=String(value||'').trim();if(s.length>max)throw Error(`Use no more than ${max} characters`);return s;}
function url(value,label){const s=text(value,2000);if(!s)return '';let u;try{u=new URL(s)}catch{throw Error(label+' must start with https:// or http://')}if(!['https:','http:'].includes(u.protocol)||u.username||u.password)throw Error(label+' must be a web link without embedded login details');return u.href;}
function image(value){const s=text(value,2000);if(!s)return '';if(/^\/(?:assets|uploads)\/[a-z\d_./%() -]+$/i.test(s)&&!s.includes('..')&&!/%(?:2e|2f|5c)/i.test(s))return s;return url(s,'Thumbnail');}
function count(value,label){if(value===''||value==null)return '';const n=Number(value);if(!Number.isInteger(n)||n<0||n>100000)throw Error(label+' must be a whole number from 0 to 100000');return n;}
function validate(input){
 if(!input||typeof input!=='object'||Array.isArray(input))throw Error('Invalid class');
 const d={title:text(input.title,160),category:text(input.category,80),faculty:text(input.faculty,160),description:text(input.description,1500),image:image(input.image)||require('../../assets/video-thumbnail').thumbnail(input.demoUrl),purchaseUrl:url(input.purchaseUrl,'Purchase link'),demoUrl:url(input.demoUrl,'Demo link'),price:text(input.price,100),access:text(input.access,160),buttonText:text(input.buttonText,60)||'Demo / Buy Now',status:input.status||'draft',availability:input.availability||'available',chapters:count(input.chapters,'Chapters'),contents:count(input.contents,'Contents'),order:Number(input.order||0)};
 if(!d.title||!d.category)throw Error('Enter a class title and category');
 if(!['published','draft'].includes(d.status))throw Error('Choose Published or Draft');
 if(!['available','upcoming'].includes(d.availability))throw Error('Choose Available or Upcoming');
 if(!Number.isInteger(d.order)||Math.abs(d.order)>100000)throw Error('Sort order must be a whole number between -100000 and 100000');
 if(d.status==='published'&&d.availability==='available'&&!d.purchaseUrl)throw Error('Add a purchase link before publishing an available class');
 return d;
}
function validatePage(input){
 if(!input||typeof input!=='object'||Array.isArray(input))throw Error('Invalid page settings');
 const d={};for(const key of Object.keys(pageDefaults))d[key]=text(input[key]??pageDefaults[key],['intro','supportText','footerText','purchaseNote'].includes(key)?1500:200);
 d.loginUrl=url(input.loginUrl??pageDefaults.loginUrl,'Student login link');
 if(!d.heading||!d.catalogueTitle)throw Error('Enter a page heading and catalogue heading');
 if(!/^[+\d\s()-]{7,30}$/.test(d.supportPhone)||d.supportPhone.replace(/\D/g,'').length<7)throw Error('Enter a valid support phone number');
 return d;
}
function phoneHref(phone){const digits=phone.replace(/\D/g,'');return 'tel:'+(phone.startsWith('+')?'+'+digits:digits.length===10?'+91'+digits:digits);}
function filterKey(category){return category.toLowerCase().replace(/\s+/g,'-');}
function card(d,settings){
 const upcoming=d.availability==='upcoming',category=esc(d.category);
 const art=d.image?`<img src="${esc(d.image)}" alt="${esc(d.title)}${d.faculty?' — '+esc(d.faculty):''}" width="640" height="360">`:`<div class="recorded-coming-art" aria-hidden="true"><b>${category}</b><span>${upcoming?'Coming soon':'Recorded class'}</span></div>`;
 const meta=[d.chapters!==''&&d.chapters!=null?`${d.chapters} chapter${Number(d.chapters)===1?'':'s'}`:'',d.contents!==''&&d.contents!=null?`${d.contents} contents`:'',d.access,d.price].filter(Boolean).map(x=>`<span>${esc(x)}</span>`).join('');
 const action=upcoming?`<a class="btn btn-outline-green" href="${esc(phoneHref(settings.supportPhone))}">Enquire about ${category} <span aria-hidden="true">↗</span></a>`:`${d.demoUrl?`<a class="btn btn-outline-green recorded-demo" href="${esc(d.demoUrl)}">Watch demo <span aria-hidden="true">↗</span></a>`:''}<a class="btn btn-green" href="${esc(d.purchaseUrl)}" aria-label="${esc(d.buttonText)}: ${esc(d.title)}">${esc(d.buttonText)} <span aria-hidden="true">↗</span></a>`;
 return `<article class="recorded-card${upcoming?' recorded-upcoming':''}" data-recorded-category="${esc(filterKey(d.category))}" data-recorded-id="${esc(d.id)}">${art}<div class="recorded-card-body"><span class="recorded-tag">${upcoming?'Coming soon · ':''}${category}</span><h3>${esc(d.title)}</h3>${d.faculty?`<p>${esc(d.faculty)}</p>`:''}${d.description?`<p>${esc(d.description)}</p>`:''}<div class="recorded-meta">${meta|| (upcoming?'<span>Details to be announced</span>':'')}</div>${action}</div></article>`;
}
async function apply($,db){
 if(!$('.recorded-page').length)return;
 $('link[href*="recorded-classes.css"]').attr('href','/assets/recorded-classes.css?v=2');
 const settings={...pageDefaults,...await db.get('global_settings','recorded-classes-page')};
 const items=(await db.list('recorded_classes')).filter(d=>d.status==='published');
 const categories=[...new Map(items.map(d=>[filterKey(d.category),d.category])).entries()];
 $('.recorded-grid').attr('data-recorded-managed','').html(items.length?items.map(d=>card(d,settings)).join(''):'<p class="recorded-empty">Recorded classes will be listed here soon. Please contact our team for updates.</p>');
 $('.recorded-filters').attr('data-recorded-managed','').attr('hidden','').html([['all','All classes'],...categories.filter(([key])=>key!=='all')].map(([key,label],i)=>`<button type="button" data-recorded-filter="${esc(key)}" aria-pressed="${i===0}">${esc(label)}</button>`).join(''));
 const upcoming=items.filter(x=>x.availability==='upcoming').length,listed=items.length-upcoming;
 $('.recorded-count').text(`${listed} course${listed===1?'':'s'} listed${upcoming?' · '+upcoming+' upcoming':''}`);
 $('.recorded-hero h1').html(esc(settings.heading)+(settings.highlight?'<br><em>'+esc(settings.highlight)+'</em>':''));
 $('.recorded-hero-grid>div>p').text(settings.intro);$('.recorded-catalogue .section-head h2').text(settings.catalogueTitle);
 $('.recorded-support h2').text(settings.supportTitle);$('.recorded-support p').text(settings.supportText);
 $('.recorded-support a').attr('href',phoneHref(settings.supportPhone)).text(settings.supportPhone+' ↗');
 $('.recorded-hero-actions a').last().attr('href',settings.loginUrl).prop('hidden',!settings.loginUrl);
 $('.recorded-catalogue .section-head>a').attr('href',settings.loginUrl).prop('hidden',!settings.loginUrl);
 $('.recorded-help h2').text(settings.footerTitle);$('.recorded-help p').text(settings.footerText);
 $('.recorded-help>a').attr('href',phoneHref(settings.supportPhone)).text('Call '+settings.supportPhone+' ↗');
 $('.recorded-purchase-note').text(settings.purchaseNote);
}
async function seed(db){
 if(await db.get('global_settings','recorded-classes-import-v1'))return;
 const {root}=require('./db'),file=path.join(root,'recorded-classes.html');
 const $=cheerio.load(fs.existsSync(file)?fs.readFileSync(file,'utf8'):'');
 const rows=$('.recorded-card').toArray().map((el,i)=>{
  const n=$(el),upcoming=n.hasClass('recorded-upcoming'),category=n.find('.recorded-tag').text().replace(/^Coming soon\s*·?\s*/i,'')||n.find('.recorded-coming-art b').text()||n.attr('data-recorded-category');
  const stats=n.find('.recorded-meta').text(),link=n.find('a[href^="https:"]').last().attr('href')||'';
  return {id:'recorded-initial-'+(i+1),data:validate({title:n.find('h3').text(),category,faculty:upcoming?'':n.find('p').first().text(),description:upcoming?n.find('p').first().text():'',image:n.children('img').attr('src')||'',purchaseUrl:link,chapters:stats.match(/(\d+) chapter/i)?.[1]||'',contents:stats.match(/(\d+) contents/i)?.[1]||'',status:'published',availability:upcoming?'upcoming':'available',order:i+1})};
 });
 // The marker and imported rows commit in one statement. Restarts never restore deleted classes.
 await db.query(`WITH claimed AS (INSERT INTO global_settings(id,data) VALUES('recorded-classes-import-v1','{"done":true}'::jsonb) ON CONFLICT DO NOTHING RETURNING id)
 INSERT INTO recorded_classes(id,data) SELECT item->>'id',item->'data' FROM jsonb_array_elements($1::jsonb) item CROSS JOIN claimed ON CONFLICT(id) DO NOTHING`,[JSON.stringify(rows)]);
 const initial={...pageDefaults,heading:$('.recorded-hero h1').clone().children().remove().end().text().trim()||pageDefaults.heading,highlight:$('.recorded-hero h1 em').text()||pageDefaults.highlight,intro:$('.recorded-hero-grid>div>p').text()||pageDefaults.intro,catalogueTitle:$('.recorded-catalogue .section-head h2').text()||pageDefaults.catalogueTitle,supportTitle:$('.recorded-support h2').text()||pageDefaults.supportTitle,supportText:$('.recorded-support p').text()||pageDefaults.supportText,supportPhone:$('.recorded-support a').clone().children().remove().end().text().trim()||pageDefaults.supportPhone,loginUrl:$('.recorded-hero-actions a').last().attr('href')||pageDefaults.loginUrl,footerTitle:$('.recorded-help h2').text()||pageDefaults.footerTitle,footerText:$('.recorded-help p').text()||pageDefaults.footerText,purchaseNote:$('.recorded-purchase-note').text()||pageDefaults.purchaseNote};
 await db.query('INSERT INTO global_settings(id,data) VALUES($1,$2) ON CONFLICT DO NOTHING',['recorded-classes-page',JSON.stringify(validatePage(initial))]);
}
module.exports={validate,validatePage,pageDefaults,apply,seed};
