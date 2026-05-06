# Tests
This directory contains all automated tests for the application. Tests are organized by type, each in its own subdirectory.

## Directories
| Directory | Type | Description |
|-----------|------|-------------|
| `e2e/` | End-to-end | Full user-flow tests via Playwright |

## Test environment
Create a `.env.test` file in the root directory with these keys to run some tests correctly:
```
TEST_NEO3_ADDRESS=NEO3_ADDRESS_HERE
TEST_NEO3_KEY=NEO3_KEY_HERE
TEST_MNEMONIC=MNEMONIC_HERE
TEST_NEO3_ENCRYPTED_KEY=NEO3_ENCRYPTED_KEY_HERE
TEST_BITCOIN_ENCRYPTED_KEY=BITCOIN_ENCRYPTED_KEY_HERE
TEST_ETHEREUM_ENCRYPTED_KEY=ETHEREUM_ENCRYPTED_KEY_JSON_HERE
TEST_ENCRYPTED_KEY_PASSWORD=ENCRYPTED_KEY_PASSWORD_HERE
```

## E2E Tests (Playwright)
Run the full app and simulate real user interactions.

### Run with build
```
npm run playwright
```

### Run headless
```
npm run playwright:headless
```

### Open with UI
```
npm run playwright:ui
```

### View report
```
npm run playwright:report
```

## Troubleshooting

### Vite Outdated Optimize Dep error
If you see `.vite/deps/chunk-{HASH}.js 504 (Outdated Optimize Dep)` when running `npm run dev`:
1. Revert `package-lock.json`, delete `node_modules` and `out` directories.
2. Run `npm i`.
3. Optionally run `npm run build`.
4. Run `npm run dev`.
