# macro-measure

[![Docker CI](https://github.com/jacobpatterson1549/macro-measure/actions/workflows/node.js.yml/badge.svg)](https://github.com/jacobpatterson1549/macro-measure/actions/workflows/node.js.yml)


measure large distances with device gps

## Building

Use the npm package manager with the argument `install` to initialize dependencies.  Then, the package manager can be used with the commands `start`, `build`, or `test`.  Example:
```bash
npm install
npm start
```

### HTTPS

The app must be run with TLS so gps coordinates from devices can be read.  When running in in development mode, a fake TLS certificate can be used.  The certificate can be easily generated *and installed* using [mkcert](https://github.com/FiloSottile/mkcert).  Then create a `.env` file in root directory, next to `package.json` with contents below.

To create the certificates, the commands below are useful.  This will create `localhost.pem` and `localhost-key.pem`.  Move them to the project root directory.

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