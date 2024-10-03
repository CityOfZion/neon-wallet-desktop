import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  timeout: 20000,
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: true,
  retries: 0,
  workers: 1,
  reporter: 'html',
  use: {
    trace: 'on-first-retry',
    testIdAttribute: 'data-test-id',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
})
