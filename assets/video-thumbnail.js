(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.LogicVideoThumbnail=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
 'use strict';
 function videoId(value){
  let url;try{url=new URL(String(value||'').trim());}catch{return '';}
  if(!['https:','http:'].includes(url.protocol)||url.username||url.password||url.port)return '';
  const host=url.hostname.toLowerCase(),parts=url.pathname.split('/').filter(Boolean);let id='';
  if(host==='youtu.be'||host==='www.youtu.be'){if(parts.length===1)id=parts[0];}
  else if(['youtube.com','www.youtube.com','m.youtube.com','music.youtube.com','youtube-nocookie.com','www.youtube-nocookie.com'].includes(host)){
   if(url.pathname==='/watch')id=url.searchParams.get('v')||'';
   else if(['shorts','embed','live'].includes(parts[0])&&parts.length===2)id=parts[1];
  }
  return /^[A-Za-z0-9_-]{11}$/.test(id)?id:'';
 }
 function thumbnail(value){const id=videoId(value);return id?'https://i.ytimg.com/vi/'+id+'/hqdefault.jpg':'';}
 return {videoId,thumbnail};
});
