const cheerio=require('cheerio');const {esc,safeUrl}=require('./content');
const moreDescriptions={'/recorded-classes':'Demos & purchase options','/blog.html':'Guides & insights','/testimonials.html':'Student video stories','/career-test.html':'Find your course direction','/placement-assistance.html':'Contact career support'};
const structure=require('./site-structure');
const moreDefault=[];
function config(s){const header={logoUrl:s.logoUrl||'/assets/favicon.svg',applyText:'Apply Now',applyUrl:'/admissions.html',whatsappText:'WhatsApp',showWhatsapp:true,showApply:true,moreText:'More',moreLinks:moreDefault,courseLinks:structure.courseLinks,aboutLinks:structure.aboutLinks,logoWidth:220,mobileLogoWidth:148,...s.header};const footer={logoUrl:s.logoUrl||'/assets/favicon.svg',quickTitle:'QUICK LINKS',coursesTitle:'COURSES',contactTitle:'CONTACT',newsletterTitle:'NEWSLETTER',newsletterPlaceholder:'Email address',newsletterButton:'Go',showNewsletter:true,copyright:'Logic School of Management. All rights reserved.',legalLinks:[{label:'Privacy Policy',url:'/privacy.html'},{label:'Payment & Refund Policy',url:'/refund-policy.html'}],logoWidth:230,mobileLogoWidth:195,quickLinks:structure.footerLinks,...s.footer};return {header,footer};}
const allowed={header:['logoUrl','applyText','applyUrl','whatsappText','showWhatsapp','showApply','moreText','moreLinks','courseLinks','aboutLinks','logoWidth','mobileLogoWidth'],footer:['logoUrl','quickTitle','coursesTitle','contactTitle','newsletterTitle','newsletterPlaceholder','newsletterButton','showNewsletter','copyright','legalLinks','logoWidth','mobileLogoWidth','quickLinks']};
function validate(part,input){if(!allowed[part]||!input||typeof input!=='object'||Array.isArray(input))throw Error('Invalid layout');const result={};for(const key of allowed[part]){if(!(key in input))continue;const v=input[key];if(['moreLinks','courseLinks','aboutLinks','legalLinks','quickLinks'].includes(key)){if(!Array.isArray(v)||v.length>30)throw Error('Use up to 30 links');result[key]=v.map(x=>{if(!String(x.label||'').trim()||!x.url)throw Error('Each link needs a label and URL');return {label:String(x.label).trim().slice(0,100),url:safeUrl(x.url)};});}else if(['logoWidth','mobileLogoWidth'].includes(key)){const n=Number(v);if(!Number.isFinite(n)||n<80||n>320)throw Error('Logo width must be between 80 and 320 pixels');result[key]=n;}else if(key.startsWith('show'))result[key]=!!v;else result[key]=key.endsWith('Url')?safeUrl(v):String(v||'').slice(0,1000);}return result;}
function hydrate(markup,name,s){const $=cheerio.load(markup,null,false),cfg=config(s),h=cfg.header,f=cfg.footer;
 $('.brand').addClass('has-logo').html(`<img class="site-logo" src="${esc(cfg[name].logoUrl||s.logoUrl||'/assets/favicon.svg')}" alt="${esc(s.siteName||'Logic School of Management')}">`);
 const phone=String(s.phone||'+91 98958 18581'),wa=String(s.whatsapp||'919895818581').replace(/\D/g,'');
 $('a[href^="tel:"]').attr('data-global-phone','').attr('href','tel:'+phone.replace(/[^+\d]/g,'')).text(phone);$('a[href^="mailto:"]').attr('data-global-email','').attr('href','mailto:'+(s.email||'info@logiceducation.org')).text(s.email||'info@logiceducation.org');
 const links=(items,cls='')=>items.map(x=>`<a${cls?` class="${cls}"`:''} href="${esc(x.url)}">${esc(x.label)}</a>`).join('');
 if(name==='header'){
 $('.site-header').attr('data-layout-managed','').attr('style',`--header-logo-width:${h.logoWidth}px;--header-logo-mobile:${h.mobileLogoWidth}px`);
 const nav=s.navigation||structure.mainLinks;
 function subitems(x){const p=require('./public-urls').canonicalPath(x.url);return p==='/courses'?h.courseLinks:p==='/about'?h.aboutLinks:[];}
 $('.desktop-nav').html(nav.map(x=>{const sub=subitems(x);return sub?.length?`<div class="nav-resource-menu"><button type="button" class="nav-link nav-more-button" aria-haspopup="true" aria-expanded="false">${esc(x.label)} <span>⌄</span></button><div class="nav-more-panel">${sub.map(d=>`<a href="${esc(d.url)}"><b>${esc(d.label)}</b></a>`).join('')}</div></div>`:links([x],'nav-link');}).join(''));
 $('.mobile-nav').html(nav.map(x=>{const sub=subitems(x);return sub?.length?`<details class="mobile-nav-group"><summary>${esc(x.label)}</summary><div>${links(sub)}</div></details>`:links([x],'nav-link');}).join(''));
 $('.desktop-nav,.mobile-nav').attr('data-layout-managed','');
 if(h.moreLinks.length){$('.desktop-nav').append(`<div class="nav-resource-menu"><button class="nav-link nav-more-button" type="button" aria-haspopup="true" aria-expanded="false">${esc(h.moreText)} <span>⌄</span></button><div class="nav-more-panel">${h.moreLinks.map(x=>`<a href="${esc(x.url)}"><b>${esc(x.label)}</b>${moreDescriptions[x.url]?`<small>${esc(moreDescriptions[x.url])}</small>`:''}</a>`).join('')}</div></div>`);}
 if(h.showApply){$('.nav-actions .btn').text(h.applyText).attr('href',h.applyUrl);$('.mobile-nav').append(`<a href="${esc(h.applyUrl)}">${esc(h.applyText)}</a>`);}else $('.nav-actions .btn').remove();
 if(h.showWhatsapp){
  // Strip legacy decorative dots from saved button labels without changing stored settings.
  const label=String(h.whatsappText||'WhatsApp').replace(/^[\s◌○◦●•]+/u,'').trim()||'WhatsApp';
  const icon=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" focusable="false" style="display:block;flex:none"><path d="M12 2a10 10 0 0 0-8.66 15L2 22l5-1.34A10 10 0 1 0 12 2Z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/><path fill="currentColor" d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.149-.67.149-.198.297-.768.967-.942 1.165-.173.199-.347.223-.644.075-.297-.149-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.654-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.521.149-.173.198-.297.298-.496.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.5-.67-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.793.372-.272.297-1.04 1.016-1.04 2.479s1.065 2.876 1.213 3.074c.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347Z"/></svg>`;
  const button=`<span class="whatsapp-button-content" style="display:inline-flex;align-items:center;gap:6px;vertical-align:middle">${icon}<span>${esc(label)}</span></span>`;
  $('.whatsapp-link').html(button).attr('href','https://wa.me/'+wa);
  $('.mobile-nav').append(`<a href="https://wa.me/${wa}">${button}</a>`);
 }else $('.whatsapp-link').remove();
 if(h.moreLinks.length)$('.mobile-nav').append(links(h.moreLinks));
 }else{
 $('.footer').attr('data-layout-managed','').attr('style',`--footer-logo-width:${f.logoWidth}px;--footer-logo-mobile:${f.mobileLogoWidth}px`);
 if('tagline'in s)$('.footer-grid>div:first-child>p').text(s.tagline);
 if('address'in s)$('.footer-grid>div:last-child>p').text(s.address);
 $('.footer-grid>div:nth-child(2)').html(`<h4>${esc(f.quickTitle)}</h4>`+links(f.quickLinks));
 $('.footer-grid>div:nth-child(3)>h4').text(f.coursesTitle);if(Array.isArray(s.footerCourses))$('.footer-grid>div:nth-child(3)').html(`<h4>${esc(f.coursesTitle)}</h4>`+links(s.footerCourses));
 $('.footer-grid>div:last-child>h4').first().text(f.contactTitle);
 if(f.showNewsletter){$('.newsletter-title').text(f.newsletterTitle);$('.newsletter input').attr('placeholder',f.newsletterPlaceholder);$('.newsletter button').text(f.newsletterButton);}else $('.newsletter-title,.newsletter').remove();
 $('.footer-bottom>span').first().html(`© <span data-year>${new Date().getFullYear()}</span> ${esc(f.copyright)}`);$('.footer-bottom>span').last().html(links(f.legalLinks));
 const social=Array.isArray(s.socialLinks)?s.socialLinks:[];if(Array.isArray(s.socialLinks))$('.social-row').html(social.map(x=>`<a class="social-link-box" href="${esc(x.url||'#')}" aria-label="${esc(x.label)}" target="_blank" rel="noopener" data-fit="${x.fit==='cover'?'cover':'contain'}">${x.iconUrl?`<img class="social-link-image" src="${esc(x.iconUrl)}" alt="">`:`<span class="social-link-fallback">${esc((x.label||'').slice(0,2).toUpperCase())}</span>`}</a>`).join(''));
 }
 return $.html();
}
module.exports={config,validate,hydrate};
