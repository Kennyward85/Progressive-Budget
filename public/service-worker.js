const FILES_TO_CACHE = [
    "/","/index.html", "/styles.css", "/index.js", "/favicon.ico",
    "/db.js", "/icons/icon-192x192.png", "/icons/icon-512x512.png"
  
  ];
  
  const STATIC_CACHE = "static-cache-v2";
  const DATA_CACHE = "data-cache-v1";

// install adds to cache 
self.addEventListener("install", function(evt) {
  evt.waitUntil(
    caches
    .open(STATIC_CACHE).then(cache => {
      console.log("Files Cached");
      return cache.addAll(FILES_TO_CACHE);
     
    })
  ); 

  self.skipWaiting();
});

// activate checkes and deltes when new service worker is loaded
self.addEventListener("activate", function(evt) {
  evt.waitUntil(
    caches.keys().then(keyList => {
      return Promise.all(
        keyList.map(key => {
          if (key !== STATIC_CACHE && key !== DATA_CACHE) {
            console.log("Removing data", key);
            return caches.delete(key);
          }
        })
      );
    })
  );

  self.clients.claim();
});

// this is what fetches the data from the api and clones it while offline
self.addEventListener("fetch", function(evt) {
  if (evt.request.url.includes("/api/")) {
    evt.respondWith(
      caches.open(DATA_CACHE).then(cache => {
        return fetch(evt.request)
          .then(response => {
            // Goor response update and add to cache
            if (response.status === 200) {
              cache.put(evt.request.url, response.clone());
            }
            return response;
          })
          .catch(err => {
            // Network request failed, 
            return cache.match(evt.request);
          });
      }).catch(err => console.log(err))
    );

    return;
  }

  evt.respondWith(
    caches.open(STATIC_CACHE).then(cache => {
      return cache.match(evt.request).then(response => {
        return response || fetch(evt.request);
      });
    })
  );
});