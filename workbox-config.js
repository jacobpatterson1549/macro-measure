const WorkboxPlugin = require('workbox-webpack-plugin');

module.exports = {
  globDirectory: 'build',
  globPatterns: [
    '**/*',
  ],
  swDest: 'build/service-worker.js',
};