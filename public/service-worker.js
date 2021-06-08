const cacheName = '%CACHE_NAME%';

const assets = [
    './?pwa',
    './favicon.ico',
    './favicon.svg',
    './favicon192.png',
    './favicon512.png',
    './manifest.json',
    './robots.txt',
    './static/js/bundle.js',
    './static/js/main.chunk.js',
    './static/js/vendors~main.chunk.js',
]; // %ASSET_MANIFEST%

self.addEventListener('install', event => (
    event.waitUntil(
        caches.open(cacheName).then(cache => (
            cache.addAll(assets)
        ))
    )
));

self.addEventListener('fetch', event => (
    event.respondWith(
        caches.match(event.request).then(response => (
            response || fetch(event.request)
        ))
    )
));

self.addEventListener('activate', event => (
    event.waitUntil(
        caches.keys().then(cacheNames => (
            Promise.all(
                cacheNames
                    .filter(name => name !== cacheName)
                    .map(name => (
                        caches.delete(name)
                    ))
            )
        ))
    )
));