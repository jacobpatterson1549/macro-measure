# macro-measure

[![Docker CI](https://github.com/jacobpatterson1549/macro-measure/actions/workflows/node.js.yml/badge.svg)](https://github.com/jacobpatterson1549/macro-measure/actions/workflows/node.js.yml)


measure large distances with device gps

## Building

Use the npm package manager of choice (`npm`/`yarn`/`pnpm`) with the argument `install` to initialize dependencies.  Then, the package manager can be used with the commands `start`, `build`, or `test`.  Example:
```bash
pnpm install
pnpm start
```

### Test coverage 

Run the commands below to generate and view coverage for all files

```bash
    # Generate coverage report
    CI=true npm test -- --coverage

    ## Open coverage report
    xdg-open coverage/lcov-report/index.html
```
