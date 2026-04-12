const fs = require('fs');
const packageJSON = require('../package.json');

const cacheName = `cache-${packageJSON.version}`;

const buildDir = fs.readdirSync('build');
const manifestAssets = JSON.stringify(
    buildDir
        .filter(f => /^index-.*\.(js|css)$/.test(f))
        .map(entrypoint => `./${entrypoint}`));
const ijPath = buildDir.find(f => /^index-.*\.js$/.test(f));
const icPath = buildDir.find(f => /^index-.*\.css$/.test(f));

const updateServiceWorker = (data) => (
    data
        .replace('%CACHE_NAME%', cacheName)
        .replace(']; // %ASSET_MANIFEST%', `].concat(${manifestAssets});`)
);

const updateIndexHtml = (data) => (
    data
        .replace('%INDEX_JS%', ijPath)
        .replace('%INDEX_CSS%', icPath)
);

const throwError = (message) => {
    throw new Error(message);
};

const updates = [
    ['service worker', 'build/service-worker.js', updateServiceWorker],
    ['index html', 'build/index.html', updateIndexHtml],
];

updates.forEach(([fileDisplay, filePath, fileFn]) => (
fs.readFile(filePath, 'utf8', (readErr, data) => (
    readErr
        ? throwError(`reading ${fileDisplay}: ${readErr.message}`)
        : fs.writeFile(filePath, fileFn(data), 'utf8', (writeErr) => (
            writeErr
                ? throwError(`writing ${fileDisplay}: ${writeErr.message}`)
                : console.log(`[generated ${fileDisplay}]`)
        ))
))));
