import { Page } from '@playwright/test'
import { _electron as electron } from 'playwright-core'

export const PASSWORD = '.7g/7i*Vcf%V3:9Ls3AAt3;i'

export const launch = async () => {
  const electronApp = await electron.launch({ args: ['.', '--no-sandbox'] })
  const window = await electronApp.firstWindow()

  await window.evaluate(() => localStorage.clear())
  await window.waitForLoadState()

  return window
}

export const createNewWallet = async (window: Page) => {
  await window.getByTestId('welcome-continue').click()
  await window.getByTestId('create-new-wallet').click()
  await window.getByTestId('security-setup-first-password').fill(PASSWORD)
  await window.getByTestId('security-setup-first-submit').click()
  await window.getByTestId('security-setup-second-password').fill(PASSWORD)
  await window.getByTestId('security-setup-second-submit').click()
  await window.getByTestId('security-setup-open-your-wallet').click()
}

export const logout = async (window: Page) => {
  await window.getByTestId('logout-button').click()
}

export const startFromScratchAndLogout = async (window: Page) => {
  await createNewWallet(window)
  await logout(window)
}

export const sleep = (seconds: number): Promise<void> => new Promise(resolve => setTimeout(resolve, seconds * 1000))
