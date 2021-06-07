const cacheName = '%CACHE_NAME%';

const assets = [
    "./?pwa",
    "./favicon.ico",
    "./favicon.svg",
    "./favicon192.png",
    "./favicon512.png",
    "./manifest.json",
    "./robots.txt",
    "./static/js/bundle.js",
    "./static/js/main.chunk.js",
    "./static/js/vendors~main.chunk.js",
]; // %ASSET_MANIFEST%

self.addEventListener("install", event => {
    event.waitUntil(
        caches.open(cacheName).then(cache => {
            return cache.addAll(assets);
        })
        .catch(error => {
            throw new Error("install: adding assets to cache failed: " + error);
        })
    );
});

self.addEventListener("fetch", event => {
    event.respondWith(
        caches.match(event.request).then(response => {
            return response || fetch(event.request);
        })
        .catch(error => {
            throw new Error("fetch: failed to get " + event.request.url + ": " + error);
        })
    );
});

self.addEventListener("activate", event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(name => {
                    if (name !== cacheName) {
                        return caches.delete(name);
                    }
                })
            );
        })
    );
});