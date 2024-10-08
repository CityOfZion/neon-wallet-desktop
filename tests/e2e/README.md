# E2E Tests
End-to-end (E2E) tests simulate real user interactions with the application, covering the entire workflow from start to finish. They verify that all parts of the system, including the front-end, back-end and any integrated services, work together seamlessly. E2E Tests ensure that the application behaves as expected in a production-like environment, providing confidence that the end-user experience will be smooth and functional. Great for keeping different screen flows in the app working.

## Directories
In each directory, there are different parts of the system, each with its own behavior. For example, if you want to see how a contact is created, then go to the file `contacts/create-contact.spec.ts`.

## Test environment
You need to create a `.env.test` file in the root directory with these keys to run some tests correctly:
```
TEST_NEO3_ADDRESS=NEO3_ADDRESS_HERE
TEST_NEO3_KEY=NEO3_KEY_HERE
TEST_MNEMONIC=MNEMONIC_HERE
```

## E2E Tests
We are using [Playwright](https://playwright.dev) for E2E tests. The directory is `tests/`. Read the `tests/README.md` to learn more. If you want to run the tests, use:

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

## Vite Outdated Optimize Dep error
If you encounter the problem with `.vite/deps/chunk-{HASH}.js 504 (Outdated Optimize Dep)` when you run `npm run dev`, follow these steps:
1. Revert the `package-lock.json` file, delete the `node_modules`, and the `out` directory.
2. Install the dependencies with `npm i`.
3. Generate a build if needed with `npm run build` (maybe be optional).
4. Run in development mode with `npm run dev`.
