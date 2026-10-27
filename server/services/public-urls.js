const fs = require('fs');
const path = require('path');
const urls = require('../../assets/public-urls');
const legacy={'/ca':'/courses/ca','/ciap-course-in-kerala-and-india':'/courses/ciap','/acca-course':'/courses/acca','/cma-usa':'/courses/cma-usa','/cma-india':'/courses/cma-india','/enrolled-agent-ea-course':'/courses/ea','/ea':'/courses/ea','/bcom-acca':'/courses/bcom-acca','/mba-acca-integrated-course':'/courses/mba-acca','/mcom-cpa':'/courses/mcom-cpa','/cpa-usa-course':'/courses/cpa-usa','/contact-us':'/contact','/about-logic':'/about','/privacy-policy':'/privacy','/online-payment-policy':'/refund-policy','/course-navigator':'/blog','/ca-foundation': '/courses/ca-foundation', '/ca-inter': '/courses/ca-inter', '/ca-final': '/courses/ca-final', '/upskilling-programs': '/skill-development', '/talent-hunter-logic-your-placement-partner': '/recruit-our-talent', '/student-life-at-logic': '/life-at-logic', '/logic-collaborates-with-asap': '/asap-collaboration', '/office-requirements-join-our-team': '/careers', '/our-hiring-partners-trusted-recruitment': '/hiring-partners', '/batch-scheduled': '/batches'};

function exists(clean, root, cache) {
  if (clean.startsWith('/blog/')) return cache.blog_posts.some(p => p.slug === clean.slice(6) && p.status === 'published');
  if (clean.startsWith('/results/')) return cache.result_categories.some(c => c.id === clean.slice(9));
  try { return fs.statSync(path.join(root, urls.sourcePath(clean))).isFile(); } catch { return false; }
}
const merged=require('./site-structure').merged;
function destination(clean){return merged[legacy[clean]||clean]||legacy[clean]||clean;}
function resolveHref(value,basePath='/',origin='https://logic.invalid'){
 const resolved=urls.href(value,basePath,origin);if(!resolved||!resolved.startsWith('/')||resolved.startsWith('//'))return resolved;
 const u=new URL(resolved,origin),target=destination(urls.canonicalPath(u.pathname)||u.pathname),[pathname,hash]=target.split('#');return pathname+u.search+(hash?'#'+hash:u.hash);
}
function redirects(root,cache,db){
 return async(req,res,next)=>{
  if(!['GET','HEAD'].includes(req.method))return next();
  const canonical=urls.canonicalPath(req.path);if(!canonical)return next();
  const queryAt=req.originalUrl.indexOf('?'),query=queryAt<0?'':req.originalUrl.slice(queryAt);
  const editorPreview='cms_edit' in (req.query||{})&&!!req.session?.username;
  if(!editorPreview&&canonical==='/meet-the-team'&&db&&!(await db.list('website_content')).some(x=>x.kind==='team'&&x.status==='published'))return res.redirect(302,'/about'+query+'#team-contact');
  const target=editorPreview?canonical:destination(canonical),[clean,hash]=target.split('#');
  if(target===req.path||!exists(clean,root,cache))return next();
  return res.redirect(301,clean+query+(hash?'#'+hash:''));
 };
}
function paths(root, cache,teamPublished=false) {
  const pages = fs.readdirSync(root).filter(p => p.endsWith('.html') && !['404.html', 'thank-you.html'].includes(p)).map(p => urls.canonicalPath('/' + p));
  pages.push(...fs.readdirSync(path.join(root, 'courses')).filter(p => p.endsWith('.html')).map(p => urls.canonicalPath('/courses/' + p)));
  pages.push(...cache.blog_posts.filter(p => p.status === 'published').map(p => '/blog/' + p.slug));
  pages.push(...cache.result_categories.map(c => '/results/' + c.id));
  return [...new Set(pages.filter(p=>p&&!merged[p]&&p!=='/explore'&&(p!=='/meet-the-team'||teamPublished)))];
}
module.exports = { ...urls, exists, redirects, paths, legacy, merged, resolveHref, destination };
