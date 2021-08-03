const FILES_TO_CACHE = [
    "/",
    "/indexedDB.js",
    "/index.js",
    "/index.html",
    "/manifest.webmanifest",
    "/styles.css",
    "/icons/icon-192x192.png",
    "/icons/icon-512x512.png"
];
  
const CACHE_NAME = "static-cache-v2";
const DATA_CACHE_NAME = "data-cache-v1";
  
// install
self.addEventListener("install", function (evt) {
  // pre cache data
  evt.waitUntil(
    caches.open(DATA_CACHE_NAME).then((cache) => cache.add(FILES_TO_CACHE))
  );
    
  // pre cache all static assets
  evt.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Cache open')
      return cache.addAll(FILES_TO_CACHE)})
  );

  // tell the browser to activate this service worker immediately once it has finished installing
  self.skipWaiting();
});

// activate
self.addEventListener("activate", event =>{
  const currentCaches = [DATA_CACHE_NAME, DATA_CACHE_NAME];
  event.waitUntil(
    caches
      .keys()
      .then(cacheNames =>{
        return cacheNames.filter(
          cacheName => !currentCaches.includes(cacheName)
        );
      })
      .then(cachesToDelete => {
        return Promise.all(
          cachesToDelete.map(cachesToDelete =>{
            return caches.delete(cachesToDelete);
          })
        );
      })
      .then(() => self.cilents.claim())
  );
    
})

// fetch
self.addEventListener("fetch", function(evt) {
  if (evt.request.url.includes("/api/")) {
    evt.respondWith(
      caches.open(DATA_CACHE_NAME).then(cache => {
        return fetch(evt.request)
          .then(response => {
            // If the response was good, clone it and store it in the cache.
            if (response.status === 200) {
              cache.put(evt.request.url, response.clone());
            }

            return response;
          })
          .catch(err => {
            // Network request failed, try to get it from the cache.
            return cache.match(evt.request);
          });
      }).catch(err => console.log(err))
    );

    return;
  }

  evt.respondWith(
    caches.open(CACHE_NAME).then(cache => {
      return cache.match(evt.request).then(response => {
        return response || fetch(evt.request);
      });
    })
  );
});
