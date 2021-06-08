const fs = require('fs');
const package = require('../package.json');
const assetManifest = require('../build/asset-manifest.json');
const swPath = 'build/service-worker.js';

const cacheName = `cache-${package.version}`;

const manifestAssets = JSON.stringify(
    assetManifest.entrypoints
        .map(entrypoint => `./${entrypoint}`));

const updateServiceWorker = (data) => (
    data
        .replace('%CACHE_NAME%', cacheName)
        .replace(']; // %ASSET_MANIFEST%', `].concat(${manifestAssets});`)
);

const throwError = (message) => {
    throw new Error(message);
};

fs.readFile(swPath, 'utf8', (err, data) => (
    err
        ? throwError(`reading service worker: ${err.message}`)
        : fs.writeFile(swPath, updateServiceWorker(data), 'utf8', (err) => (
            err
                ? throwError(`writing service worker: ${err.message}`)
                : console.log('[generated service worker]')
        ))
));