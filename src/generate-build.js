const fs = require('fs');
const packageJSON = require('../package.json');
const encoding = 'utf8';

const cacheName = `cache-${packageJSON.version}`;

const buildDir = fs.readdirSync('build');
const manifestAssets = JSON.stringify(
    buildDir
        .filter(f => /^index-.*\.(js|css)$/.test(f))
        .map(entrypoint => `./${entrypoint}`));
const ijPath = buildDir.find(f => /^index-.*\.js$/.test(f));
const icPath = buildDir.find(f => /^index-.*\.css$/.test(f));

const throwError = (message) => {
    throw new Error(message);
};

const updates = [
    ['build/service-worker.js', '%CACHE_NAME%', cacheName],
    ['build/service-worker.js', ']; // %ASSET_MANIFEST%', `].concat(${manifestAssets});`],
    ['build/index.html', '%INDEX_JS%', ijPath],
    ['build/index.html', '%INDEX_CSS%', icPath],
]
.map(update => ({
    filePath:    update[0],
    pattern:     update[1],
    replacement: update[2],
}));

Object.entries(
	Object.groupBy(
		updates,
		update => update.filePath))
    .forEach(([filePath, updates]) => (
        fs.readFile(
			filePath,
			encoding,
			(readErr, initialData) => (
            	readErr
                	? throwError(`reading ${filePath}: ${readErr.message}`)
	                : fs.writeFile(
    	                filePath,
        	            updates.reduce((currentData, update) => (
            	            currentData.replace(
                	            update.pattern,
                    	        update.replacement)),
	                        initialData),
    	                'utf8',
        	            writeErr => (
            	            writeErr
                	            ? throwError(`writing ${filePath}: ${writeErr.message}`)
                    	        : console.log(`[generated ${filePath}]`)))))));
