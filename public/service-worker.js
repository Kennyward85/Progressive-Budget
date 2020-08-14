const FILES_TO_CACHE = [
    "/index.html", "/styles.css", "/index.js", "/favicon.ico",
    "/db.js", "/icons/icon-192x192.png", "/icons/icon-512x512.png",
  
  ];
  
  const CACHE_NAME = "static-cache-v2";
  const DATA_CACHE = "cache-v1";
  
  self.addEventListener("install", evt => {
    console.log('Install event in process')
    evt.waitUntil(
      caches.open(CACHE_NAME)
      .then(cache => cache.addAll(FILES_TO_CACHE)
       )    
    );
    console.log('Install complete')
  });  
  
    self.skipWaiting();
  
  
  self.addEventListener("activate", evt => {
    console.log('activation in progress')
    // remove old caches
    evt.waitUntil(
      caches.keys().then(thisKey => {
        return Promise.all(
          thisKey.map(keyList =>{
            if( keyList !== CACHE_NAME && keyList !== DATA_CACHE) {
              console.log("Removing Cached Information", KeyList);
              return caches.delete(keyList)
              
            }
          }),
          console.log("activation complete")
        )
      
        })
        )
    self.clients.claim()
  });


  self.addEventListener("fetch", evt => {
    if (evt.request.url.includes("/api/")) {
      console.log("Data fetched")
      evt.respondWith(
        caches
        .open(DATA_CACHE)
          .then(cache => {
            return fetch(evt.request)
              .then(response => {
                  cache.put(evt.request, response.clone());
                 return response;
           })
              }).catch(() => caches.match(evt.request))            
       );
            return;
      }
   
    // Using Cached information first
    evt.respondWith(
      caches.match(evt.request).then(response => {
        console.log("Responding with information from cache")
       if(response) {
         return response;
       }
      
      //  Making request and caching the response if it is not there
      return caches.open(DATA_CACHE).then(cache => {
        return fetch(evt.request).then(response => {
          return cache.put(evt.request, response.clone()).then(() => {
            return response;
          })
        })
      })
      })
  )}
  );
 