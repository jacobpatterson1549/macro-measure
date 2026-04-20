# macro-measure

[![Docker CI](https://github.com/jacobpatterson1549/macro-measure/actions/workflows/node.js.yml/badge.svg)](https://github.com/jacobpatterson1549/macro-measure/actions/workflows/node.js.yml)

measure large distances with device gps

## Dependencies

* [Node](https://github.com/nodejs/node) and [npm](https://github.com/npm/cli) are used to build the code
* [React](https://github.com/facebook/react) is the javascript library that makes the site functional
* [Jest](https://github.com/jestjs/jest) is the test/mock tool
* [Testing-Library](https://github.com/testing-library) is full of test helper functions
* [esbuild](https://github.com/evanw/esbuild) is the build tool to quickly bundle and minify code
* [geolocation-utils](https://github.com/teqplay/geolocation-utils) is used for geographic coordinate distance and heading calculations

## Building

The scripts in the package.json file perform build tasks.

* `npm install` downloads build dependencies
* `npm run build` compiles a production build to the build/ folder
* `npm run dev` serves a development version of the site
* `npm run test` runs the tests
    * `npm run test -- --watch` runs in interactive mode
    * `npm run test -- --coverage` generates test coverage to the coverage/ folder
* `npm clean` removes dependencies, the production build, test coverage reports, and generated code

### Docker

* Build/run with [Docker](https://www.docker.com) and [docker-compose](https://github.com/docker/compose).
* Runs on a slim [nginx](https://github.com/nginx/nginx) image.
* Run locally with `docker compose up --build` on (http://localhost:3000/)
