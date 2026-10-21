const CACHE_NAME = "asher-poet-v1";

const APP_FILES = [
"./",
"./manifest.json"
];

self.addEventListener("install", function(event) {
event.waitUntil(
caches.open(CACHE_NAME).then(function(cache) {
return cache.addAll(APP_FILES);
})
);

self.skipWaiting();
});

self.addEventListener("activate", function(event) {
event.waitUntil(
caches.keys().then(function(keys) {
return Promise.all(
keys
.filter(function(key) {
return key !== CACHE_NAME;
})
.map(function(key) {
return caches.delete(key);
})
);
})
);

self.clients.claim();
});

self.addEventListener("fetch", function(event) {
if (event.request.method !== "GET") return;

const url = new URL(event.request.url);

if (url.origin !== self.location.origin) return;

event.respondWith(
fetch(event.request)
.then(function(response) {
if (response.ok) {
const copy = response.clone();

      caches.open(CACHE_NAME).then(function(cache) {
        cache.put(event.request, copy);
      });
    }

    return response;
  })
  .catch(function() {
    return caches.match(event.request).then(function(cached) {
      return cached || caches.match("./");
    });
  })

);
});
