import { defineConfig, devices } from '@playwright/test'
import dotenv from 'dotenv'

dotenv.config({ path: ['.env', '.env.test'] })

export default defineConfig({
  timeout: 40000,
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: false,
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
