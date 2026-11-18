/* D9: network first, cache as offline fallback. */
const C='d9-v1';
self.addEventListener('install',e=>{self.skipWaiting()});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k.indexOf('d9-')===0&&k!==C).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
 if(e.request.method!=='GET')return;
 const u=new URL(e.request.url);
 if(u.origin!==location.origin)return;
 e.respondWith(fetch(e.request).then(res=>{if(res.ok){const cl=res.clone();caches.open(C).then(c=>c.put(e.request,cl));}return res;}).catch(()=>caches.match(e.request,{ignoreSearch:true})));
});
