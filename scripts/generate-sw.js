const fs = require('fs');
const package = require("../package.json");
const assetManifest = require("../build/asset-manifest.json");
const swPath = 'build/service-worker.js';

const cacheName = `cache-${package.version}`;

const manifestAssets = JSON.stringify(
    assetManifest.entrypoints
        .map(entrypoint => `./${entrypoint}`));

fs.readFile(swPath, 'utf8', (err, oldSW) => {
    if (err) {
        throw new Error(`reading service worker: ${err.message}`);
    }

    console.log(`setting service worker cache name to ${cacheName}\n`);
    console.log(`appending service worker assets with ${manifestAssets}\n`);
    const newSW = oldSW
        .replace('%CACHE_NAME%', cacheName)
        .replace(']; // %ASSET_MANIFEST%', `].concat(${manifestAssets});`);

    fs.writeFile(swPath, newSW, 'utf8', (err) => {
        if (err) {
            throw new Error(`writing service worker: ${err.message}`);
        }
        console.log('[generated service worker]')
    });
});