var CACHE_STATIC_NAME = 'static-v11';
var CACHE_DYNAMIC_NAME = 'dynamic-v2';

self.addEventListener('install', function(event) {
    console.log('[Service Worker] Installing Service Worker ...', event);
    // Make sure that cache is open before cache is accessed during fetch!
    event.waitUntil(
        caches.open(CACHE_STATIC_NAME)
        .then(function(cache){
            console.log('[Service Worker] Precaching App Shell');
            cache.addAll([
                '/',
                '/index.html',
                '/offline.html',
                '/src/js/app.js',
                '/src/js/feed.js',
                '/src/js/promise.js',
                '/src/js/fetch.js',
                '/src/js/material.min.js',
                '/src/css/app.css',
                '/src/css/feed.css',
                '/src/images/main-image.jpg',
                'https://fonts.googleapis.com/css?family=Roboto:400,700',
                'https://fonts.googleapis.com/icon?family=Material+Icons',
                'https://cdnjs.cloudflare.com/ajax/libs/material-design-lite/1.3.0/material.indigo-pink.min.css'
              ]);   
        })
    )
});

self.addEventListener('activate', function(event) {
    console.log('[Service Worker] Activating Service Worker ...', event);
    
    // Clean up here - activate is called only when the first instance of the web app
    // starts (only tab with this app, all other instances were closed)
    // => Otherwise (e.g. if called in 'install') cleaning up the cache could break
    // running instances in other tabs
    event.waitUntil(
        caches.keys()
            .then(function(keyList){
                return Promise.all(keyList.map(function(key){
                    if (key !== CACHE_STATIC_NAME && key != CACHE_DYNAMIC_NAME){
                        console.log('[Service Worker] Removing old cache.', key);
                        return caches.delete(key);
                    }
                }));
            })
    );
    return self.clients.claim();
});

self.addEventListener('fetch', function (event) {
    var url = 'https://httpbin.org/get';
  
    if (event.request.url.indexOf(url) > -1) {
        // CACHE FIRST, than ALWAYS network (for possibly updated content)
      event.respondWith(
        caches.open(CACHE_DYNAMIC_NAME)
            .then(function (cache) {
                return fetch(event.request)
            .then(function (res) {
                cache.put(event.request, res.clone());
                return res;
            });
          })
      );
    } else {
        // CACHE FIRST, then only FALLBACK to network
        event.respondWith(
        caches.match(event.request)
          .then(function (response) {
            if (response) {
              return response;
            } else {
              return fetch(event.request)
                .then(function (res) {
                  return caches.open(CACHE_DYNAMIC_NAME)
                    .then(function (cache) {
                      cache.put(event.request.url, res.clone());
                      return res;
                    })
                })
                .catch(function (err) {
                  return caches.open(CACHE_STATIC_NAME)
                    .then(function (cache) {
                        if (event.request.url.indexOf('/help')){
                            return cache.match('/offline.html');
                        }
                    });
                });
            }
          })
      );
    }
  });