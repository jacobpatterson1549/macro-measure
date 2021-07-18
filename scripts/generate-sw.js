const fs = require('fs');
const packageJSON = require('../package.json');
const assetManifest = require('../build/asset-manifest.json');
const swPath = 'build/service-worker.js';

const cacheName = `cache-${packageJSON.version}`;

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

fs.readFile(swPath, 'utf8', (readErr, data) => (
    readErr
        ? throwError(`reading service worker: ${readErr.message}`)
        : fs.writeFile(swPath, updateServiceWorker(data), 'utf8', (writeErr) => (
            writeErr
                ? throwError(`writing service worker: ${writeErr.message}`)
                : console.log('[generated service worker]')
        ))
));