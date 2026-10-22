const CACHE='tactics-__CACHE_VERSION__';
const ASSETS=['./','./index.html','./manifest.webmanifest','./src/styles.css?v=__CACHE_VERSION__','./src/main.js?v=__CACHE_VERSION__','./src/engine.js?v=__CACHE_VERSION__','./src/plays.js?v=__CACHE_VERSION__','./src/field.js?v=__CACHE_VERSION__','./icons/icon.svg','./icons/icon-180.png','./icons/icon-192.png','./icons/icon-512.png'];
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS)).then(()=>self.skipWaiting()));});
self.addEventListener('activate',event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith('tactics-')&&key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',event=>{
  const request=event.request;
  if(request.method!=='GET'||new URL(request.url).origin!==self.location.origin)return;
  event.respondWith(fetch(request).then(response=>{
    if(response.ok){const copy=response.clone();event.waitUntil(caches.open(CACHE).then(cache=>cache.put(request,copy)));}
    return response;
  }).catch(()=>caches.match(request).then(cached=>cached||Response.error())));
});
