const FILES_TO_CACHE = [
    "/",
    "/db.js",
    "/index.js",
    "/manifest.webmanifest",
    "/styles.css",
    "/icons.icon-192x192.png",
    "/icons.icon-512x512.png"
  ];
  
  const CACHE_NAME = "my-site-cache-v1";
  const DATA_CACHE_NAME = "data_cache_v1";
  
  self.addEventListener("install", event => {
    event.waitUntil(
      caches
        .open(CACHE_NAME)
        .then(cache => cache.addAll(FILES_TO_CACHE))
        .then(() => self.skipWaiting())
    );
  });
  
  
  self.addEventListener("fetch", event => {
    // non GET requests are not cached and requests to other origins are not cached
    if (
      event.request.method !== "GET" ||
      !event.request.url.startsWith(self.location.origin)
    ) {
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
      );
      return;
    }
  
    // use cache first for all other requests for performance
    event.respondWith(
      fetch(event.request).catch(()=>{
        return caches.match(event.request).then(cachedResponse => {
          if (cachedResponse) {
            return cachedResponse;
          } else if(event.request.headers.get("accept").includes("text/html")){
            return caches.match("/")
          }
      })
      
      })
    );
  });
  