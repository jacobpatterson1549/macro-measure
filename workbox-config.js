const WorkboxPlugin = require('workbox-webpack-plugin');

module.exports = {
  globDirectory: 'public',
  globPatterns: [
    '**/*',
  ],
  swDest: 'public/service-worker.js',
};