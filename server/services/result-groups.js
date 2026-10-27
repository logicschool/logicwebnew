const {esc,result}=require('./content');
// Group only within the selected category; legacy posters retain their visibility.
function render(items,categoryId){
 const groups=new Map();
 for(const item of [...items].filter(r=>r.categoryId===categoryId&&r.status!=='draft').sort((a,b)=>(Number(a.order)||0)-(Number(b.order)||0)||String(a.id||'').localeCompare(String(b.id||'')))){
  const heading=String(item.groupHeading||'').trim();
  if(!groups.has(heading))groups.set(heading,[]);
  groups.get(heading).push(item);
 }
 if(!groups.size)return '<p>Results will be published here when available.</p>';
 return [...groups].map(([heading,rows])=>`<section class="result-session-group">${heading?`<h2 class="result-session-heading">${esc(heading)}</h2>`:''}<div class="result-poster-grid" aria-label="${esc(heading||'Results')}">${rows.map(result).join('')}</div></section>`).join('');
}
module.exports={render};
