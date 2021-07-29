const FILES_TO_CACHE = [
    "/",
    "/db.js",
    "/index.js",
    "/manifest.webmanifest",
    "/styles.css",
    "/icons.icon-192x192.png",
    "/icons.icon-512x512.png"
  ];
  
  const CACHE_NAME = "budget-cache-v1";
  const DATA_CACHE_NAME = "data_cache_v1";
  
  self.addEventListener("install", event => {
    event.waitUntil(
      caches
        .open(CACHE_NAME)
        .then(cache => cache.addAll(FILES_TO_CACHE))
        .then(() => self.skipWaiting())
    );
  });

  self.addEventListener("activate", event => {
    event.waitUntil(
      caches.keys().then(keyList => {
        return Promise.all(
          keyList.map(key => {
            if (key !== CACHE_NAME && key !== DATA_CACHE_NAME) {
              console.log("Removing old cache data", key);
              return caches.delete(key);
            }
          })
        );
      })
    );
  
    self.clients.claim();
  });
  
  
  self.addEventListener("fetch", event => {
    if(event.request.method !== 'GET' || !event.request.url.startsWith(self.location.origin)) {
      event.respondWith(fetch(event.request));
      return;
    }
    // handle runtime GET requests for data from /api routes
    if (event.request.url.includes("/api/")) {
      // make network request and fallback to cache if network request fails (offline)
      event.respondWith(
        caches.open(DATA_CACHE_NAME).then(cache => {
          return fetch(event.request)
            .then(response => {
              if(response.status===200){
                cache.put(event.request, response.clone());
              }
              return response;
            })
            .catch((err) => caches.match(event.request));
        })
          .catch(err=>console.log(err))
      );
      return;
    }
  
    // use cache first for all other requests for performance
    event.respondWith(
      caches.open(CACHE_NAME).then((cache)=>{
        return cache.match(event.request).then((response)=>{
          return response || fetch(event.request);
        })
      })
    );
  });
  