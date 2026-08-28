const CACHE='emotion-sense-shell-v14';
const ASSETS=[
  './','./index.html','./styles.css?v=11','./brand.css?v=14','./app.js?v=14',
  './app-main.js?v=14','./app-core.js?v=14','./cohesion.js?v=14','./onboarding.js?v=14',
  './manifest.webmanifest','./icon.svg','./logo.svg','./favicon.ico','./apple-touch-icon.png','./icon-192.png'
];

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
  if(url.origin!==self.location.origin) return;
  event.respondWith(
    fetch(event.request,{cache:'no-store'}).then(response=>{
      const copy=response.clone();
      caches.open(CACHE).then(cache=>cache.put(event.request,copy));
      return response;
    }).catch(()=>caches.match(event.request).then(hit=>hit||caches.match('./index.html')))
  );
});
