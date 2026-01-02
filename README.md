# macro-measure

[![Docker CI](https://github.com/jacobpatterson1549/macro-measure/actions/workflows/node.js.yml/badge.svg)](https://github.com/jacobpatterson1549/macro-measure/actions/workflows/node.js.yml)

measure large distances with device gps

## Dependencies

* [Node](https://github.com/nodejs/node) and [npm](https://github.com/npm/cli) are used to build the code
* [React](https://github.com/facebook/react) is the javascript library that makes the site functional
* [Testing-Library](https://github.com/testing-library) is for testing
* [Workbox](https://github.com/GoogleChrome/workbox) generates the service worker that allows users to install the site as a progressive web application and function offline
* [geolocation-utils](https://bitbucket.org/teqplay/geolocation-utils/src/master) is used for geographic coordinate distance and heading calculations

## Building

The scripts in the package.json file perform build tasks.

* `npm install` downloads build dependencies
* `npm run build` compiles a production build to the build/ folder
* `npm start` serves a development version of the site
* `npm test` runs the tests in interactive mode, run `CI=true npm test -- --coverage` to generate test coverage to the coverage/ folder.
To debug tests in Visual Studio Code, run `npm test` in a separate terminal and then run the command `Debug: Attach to Node Process`.  The attach command can be searched for with ctrl+shift+p.  If
* `npm clean` removes dependencies, the production build, test coverage reports, and generated code, excluding user certificates and environment configuration files
* `npm eject` removes react plugins that manage the majority of dependencies

### Docker

* Build/run with [Docker](https://www.docker.com) and [docker-compose](https://github.com/docker/compose).
* Runs on a slim [nginx](https://github.com/nginx/nginx) image.
* Run locally with `docker compose up --build` on (http://localhost:3000/)

### HTTPS

The app must be run with TLS so the device location can be accessed. Use a fake certificate when running in development.  Generate and install the public and private certificates using [mkcert](https://github.com/FiloSottile/mkcert).  Move the certificates to the project root directory and create an environment configuration file named `.env` with the contents below.

To create the certificates, the commands below are useful.  This will create public and private certificates, `localhost.pem` and `localhost-key.pem`.  Move them to the project root directory.

**commands to create certificates:**
```bash
mkcert -install
mkcert localhost
```

**.env file contents:**

```
HTTPS=true
SSL_CRT_FILE=localhost.pem
SSL_KEY_FILE=localhost-key.pem
```
