const CACHE='emotion-sense-shell-v10';
const ASSETS=['./','./index.html','./styles.css?v=5','./app.js?v=5','./app-main.js?v=10','./experience.js?v=10','./polish.js?v=10','./app-core.js?v=10','./manifest.webmanifest'];

self.addEventListener('install',event=>{
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS)));
});

self.addEventListener('activate',event=>{
  event.waitUntil(Promise.all([
    caches.keys().then(keys=>Promise.all(keys.filter(key=>key!==CACHE).map(key=>caches.delete(key)))),
    self.clients.claim()
  ]));
});

self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET') return;
  const url=new URL(event.request.url);
  if(url.origin===self.location.origin){
    event.respondWith(
      fetch(event.request,{cache:'no-store'}).then(response=>{
        const copy=response.clone();
        caches.open(CACHE).then(cache=>cache.put(event.request,copy));
        return response;
      }).catch(()=>caches.match(event.request).then(hit=>hit||caches.match('./index.html')))
    );
  }
});
