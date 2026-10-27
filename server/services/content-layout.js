'use strict';
const {esc}=require('./content');
const schemas=require('./site-content-schema');
const {canonicalPath}=require('./public-urls');

const initial=[
 {id:'layout-learning-1',kind:'learning',title:'Choose your professional pathway',description:'Compare Indian, international and integrated programmes with guidance from the Logic admissions team.',url:'/courses',buttonText:'Explore courses'},
 {id:'layout-learning-2',kind:'learning',title:'Find a batch that fits',description:'Check classroom, online and hybrid options for your course. Confirm the current schedule with admissions.',url:'/batches',buttonText:'View batch schedule'},
 {id:'layout-learning-3',kind:'learning',title:'Continue beyond the classroom',description:'Explore recorded classes, skill-development initiatives and placement assistance as you plan your next step.',url:'/recorded-classes',buttonText:'Explore recorded classes'},
 {id:'layout-resource-1',kind:'resources',title:'Batch schedule',description:'Find course, branch and timing information in one place.',url:'/batches',buttonText:'Check batches'},
 {id:'layout-resource-2',kind:'resources',title:'Career guidance',description:'Explore a course direction based on your interests and goals.',url:'/career-test',buttonText:'Take the career test'},
 {id:'layout-resource-3',kind:'resources',title:'Recorded classes',description:'Browse subjects, faculty and available demo or purchase links.',url:'/recorded-classes',buttonText:'Browse classes'},
 {id:'layout-resource-4',kind:'resources',title:'Placement assistance',description:'Connect with the placement team for career support.',url:'/placements#placement-assistance',buttonText:'Get placement support'}
];
async function seed(db){
 if(await db.get('global_settings','content-layout-v1'))return;
 const {validate}=require('./site-content');
 const rows=initial.map((d,i)=>({id:d.id,data:validate(d.kind,{...d,order:i,status:'published'})}));
 const fs=require('fs'),path=require('path'),cheerio=require('cheerio'),{root}=require('./db');
 const summaries=[];
 for(const p of await db.list('programs')){
  const route=canonicalPath(p.url);if(!/^\/courses\/[a-z0-9-]+$/.test(route||''))continue;
  const file=path.join(root,require('./public-urls').sourcePath(route));if(!fs.existsSync(file))continue;
  const doc=cheerio.load(fs.readFileSync(file,'utf8')),summary=doc('.course-hero p').first().text().trim();
  if(summary)summaries.push({id:p.id,summary});
 }
 // Atomic one-time insertion. Deleted or edited CMS content is never restored.
 await db.query(`WITH claim AS (INSERT INTO global_settings(id,data) VALUES('content-layout-v1','{"done":true}'::jsonb) ON CONFLICT DO NOTHING RETURNING id), summaries AS (UPDATE programs SET data=programs.data||jsonb_build_object('summary',s.item->>'summary') FROM jsonb_array_elements($2::jsonb) AS s(item),claim WHERE programs.id=s.item->>'id' AND NOT programs.data ? 'summary' RETURNING programs.id) INSERT INTO website_content(id,data) SELECT item->>'id',item->'data' FROM jsonb_array_elements($1::jsonb) item CROSS JOIN claim ON CONFLICT DO NOTHING`,[JSON.stringify(rows),JSON.stringify(summaries)]);
}
function section(id,cfg,body,extra=''){
 return `<section class="section logic-content-section ${extra}" id="${esc(id)}" data-content-layout-generated><div class="container"><div class="section-head"><div><span class="eyebrow">${esc(cfg.eyebrow)}</span><h2>${esc(cfg.title)}</h2>${cfg.intro?`<p>${esc(cfg.intro)}</p>`:''}</div>${cfg.url&&cfg.buttonText?`<a class="text-button" href="${esc(cfg.url)}">${esc(cfg.buttonText)} →</a>`:''}</div>${cfg.body?require('./site-content').paragraphs(cfg.body):''}${body}</div></section>`;
}
function matchesCourse(row,slug,title){
 const norm=s=>String(s||'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
 const target=norm(title),batch=norm(row.title),key=norm(slug);
 return !!batch&&[target,key].filter(Boolean).some(v=>batch===v||batch.startsWith(v+' '));
}
async function apply($,db,pathname){
 const clean=canonicalPath(pathname),home=clean==='/';
 const course=/^\/courses\/[^/]+$/.test(clean||'');
 if(!home&&!course)return;
 $('[data-content-layout-generated]').remove();
 $('head').append('<link rel="stylesheet" href="/assets/content-layout.css?v=1" data-content-layout-generated>');
 if(!$('link[href^="/assets/site-content.css"]').length)$('head').append('<link rel="stylesheet" href="/assets/site-content.css?v=batch-schedule-2" data-content-layout-generated>');
 const {card}=require('./site-content');
 const all=(await db.list('website_content')).filter(d=>d.status==='published');
 const rows=kind=>all.filter(d=>d.kind===kind).sort((a,b)=>(Number(a.order)||0)-(Number(b.order)||0));
 const settings=async kind=>({...schemas[kind].defaults,...await db.get('global_settings','site-page-'+kind)});
 const recorded=(await db.list('recorded_classes')).filter(d=>d.status==='published');
 if(home){
  $('body').addClass('logic-content-home');
  const main=$('main').first();
  for(const kind of ['learning','faculty','resources']){
   const items=rows(kind);if(!items.length)continue;
   main.append(section('home-'+kind,await settings(kind),`<div class="logic-content-grid ${kind==='faculty'?'logic-faculty-grid':''}">${items.map(d=>card({...d,kind:kind==='faculty'?'team':d.kind})).join('')}</div>`));
  }
  const previews=rows('class-previews');
  const demos=recorded.filter(d=>d.demoUrl&&d.image).slice(0,3).map(d=>({id:d.id,title:d.title,subtitle:d.faculty||d.category,description:d.description,image:d.image,url:d.demoUrl,buttonText:'Watch demo'}));
  const clips=previews.length?previews:demos;
  if(clips.length)main.append(section('home-class-previews',await settings('class-previews'),`<div class="logic-content-grid">${clips.map(d=>card({...d,buttonText:d.buttonText||'Watch class'})).join('')}</div>`));
  else if(recorded.length)main.append(section('home-class-previews',await settings('class-previews'),`<div class="logic-content-grid">${recorded.slice(0,3).map(d=>card({id:d.id,title:d.title,subtitle:d.faculty||d.category,description:d.description,image:d.image,url:'/recorded-classes',buttonText:'View class details'})).join('')}</div>`));
  const publishedResults=(db.cache.results||[]).filter(d=>d.status!=='draft'&&d.image);
  if(publishedResults.length)main.append(section('home-achievers',{eyebrow:'OUR ACHIEVERS',title:'Their progress. Your inspiration.',intro:'Explore results shared by the Logic community.',url:'/results',buttonText:'View all results'},`<div class="logic-achiever-grid">${publishedResults.slice(0,6).map(require('./content').result).join('')}</div>`));
  const posts=(db.cache.blog_posts||[]).filter(d=>d.status==='published').sort((a,b)=>String(b.publishedDate||'').localeCompare(String(a.publishedDate||''))).slice(0,3);
  if(posts.length)main.append(section('home-insights',{eyebrow:'FROM LOGIC',title:'Ideas for your next step.',intro:'Course guidance, career perspectives and updates.',url:'/blog',buttonText:'Read the blog'},`<div class="logic-content-grid">${posts.map(require('./content').blogCard).join('')}</div>`));
  // Move existing sections rather than replacing their CMS-authored contents.
  const order=['.stat-strip','.home-hero','.programmes','#home-learning','.home-partners-section','#home-faculty','.difference','.home-testimonials-section','.results-preview','#home-achievers','.hiring-band','#home-class-previews','#home-resources','#home-insights','.campus-preview','.sc-affiliations','.faq-section','.callback-band'];
  const blocks=order.flatMap(s=>main.children(s).toArray());
  for(const el of blocks)main.append(el);
  $('.programmes .filter-row').each((i,e)=>{if(!$(e).find('[data-filter="skill"]').length)$(e).append('<button class="filter-chip" data-filter="skill" data-content-layout-generated>Skill programmes</button>');});
  $('.programmes .filter-chip').attr('aria-pressed','false').filter('.active').attr('aria-pressed','true');
  $('.results-preview .source-note').filter((i,e)=>$(e).text().includes('original Figma')).text('Explore course-wise results and placement stories from the Logic community.');
 }else{
  const slug=clean.split('/').pop();
  const program=(db.cache.programs||[]).find(p=>canonicalPath(p.url)===clean);
  const name=program?.title||$('.course-hero h1,.page-hero h1').first().text().trim();
  const batches=rows('batches').filter(d=>matchesCourse(d,slug,name));
  const classes=recorded.filter(d=>matchesCourse({title:d.category},slug,name));
  const items=batches.slice(0,3).map(d=>card({id:d.id,title:d.title,subtitle:[d.branch,d.mode].filter(Boolean).join(' · '),description:[d.schedule,d.time].filter(Boolean).join('\n'),url:d.url||'/admissions?course='+encodeURIComponent(name),buttonText:'Confirm batch details'}));
  if(!batches.length)items.push(card({title:'Plan your next batch',description:'Speak with admissions about current fees, available learning modes and the next intake for '+name+'.',url:'/admissions?course='+encodeURIComponent(name),buttonText:'Ask admissions'}));
  if(classes.length)items.push(card({title:'Recorded learning options',description:'Explore available '+name+' classes, subject details and demo links.',url:'/recorded-classes',buttonText:'View recorded classes'}));
  // CA level pages already have their own CMS-driven batch and enquiry sections.
  if(!/^ca-(foundation|inter|final)$/.test(slug)){
   const markup=section('course-batches',{eyebrow:'YOUR NEXT STEP',title:'Batches & learning options',intro:'Confirm current dates, fees and availability with admissions.',url:'/batches',buttonText:'All batches'},'<div class="logic-content-grid">'+items.join('')+'</div>');
   const enquiry=$('#course-enquire').first();if(enquiry.length)enquiry.before(markup);else $('main').append(markup);
   $('.course-section-nav .container').append('<a href="#course-batches" data-content-layout-generated>Batches & fees</a>');
  }
 }
}
module.exports={apply,seed,matchesCourse};
