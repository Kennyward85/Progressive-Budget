const FILES_TO_CACHE = [
    "/index.html", "/styles.css", "/index.js", "/favicon.ico",
    "/db.js", "/icons/icon-192x192.png", "/icons/icon-512x512.png",
  
  ];
  
  const CACHE_NAME = "static-cache-v1";
  const DATA_CACHE = "data-cache-v1";

  self.addEventListener("install", evt => {
    console.log('Install event in process')
    evt.waitUntil(
      caches.open(CACHE_NAME)
      .then(cache => cache.addAll(FILES_TO_CACHE)
       )    
    );

  self.skipWaiting();
});

// activate
self.addEventListener("activate", evt => {
  evt.waitUntil(
    caches.keys().then(keyList => {
      return Promise.all(
        keyList.map(key => {
          if (key !== CACHE_NAME && key !== DATA_CACHE) {
            console.log("Removing old cache data", key);
            return caches.delete(key);
          }
        })
      );
    })
  );

  self.clients.claim();
});

// fetch
self.addEventListener("fetch", evt => {
  if (evt.request.url.includes("/api/")) {
    evt.respondWith(
      caches.open(DATA_CACHE).then(cache => {
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
