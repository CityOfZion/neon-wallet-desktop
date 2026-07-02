import { ElectronApplication, Page } from '@playwright/test'
import { resolve } from 'path'
import { _electron as electron } from 'playwright-core'

import { TCreateContact } from './types'

export const PASSWORD = '.7g/7i*Vcf%V3:9Ls3AAt3;i'
export const ADDRESSES = ['NRwXs5yZRMuuXUo7AqvetHQ4GDHe3pV7Mb', 'NcuusM86eJ1u1FKxh2qUUpfsQ1kgjZqNrf']

let electronApp: ElectronApplication

const filePath = resolve('./tests/e2e/files')

export const launch = async (shouldResetStorage = true) => {
  if (electronApp) await electronApp.close()

  electronApp = await electron.launch({ args: ['.', '--no-sandbox'] })

  await electronApp.evaluate(async ({ dialog }, filePath) => {
    dialog.showOpenDialog = async () => {
      return {
        canceled: false,
        filePaths: [filePath],
      }
    }
  }, filePath)

  const window = await electronApp.firstWindow()

  if (shouldResetStorage) await window.evaluate('window.localStorage.clear()')

  await window.reload({ waitUntil: 'load' })

  return window
}

export const sleep = (seconds: number): Promise<void> => new Promise(resolve => setTimeout(resolve, seconds * 1000))

export const createNewWallet = async (window: Page) => {
  await createWalletUntilCompletionStep(window)
  await window.getByTestId('security-setup-open-your-wallet').click()

  await sleep(1)
}

export const createWalletUntilCompletionStep = async (window: Page) => {
  await window.getByTestId('welcome-continue').click()
  await window.getByTestId('create-new-wallet').click()
  await window.getByTestId('security-setup-first-password').fill(PASSWORD)
  await window.getByTestId('security-setup-first-submit').click()
  await window.getByTestId('security-setup-second-password').fill(PASSWORD)
  await window.getByTestId('security-setup-browse-button').click()
  await window.getByTestId('security-setup-second-submit').click()

  // Wait the modal
  await sleep(1)

  const blockchains = await window.getByTestId('blockchains-list').locator('> li > label').all()

  // Remove the first (Neo 3), because it's already selected
  for (const blockchain of blockchains.slice(1)) {
    await blockchain.click()
  }

  await window.getByTestId('blockchain-selection-submit').click()
}

export const navigateToGeneralSettings = async (window: Page) => {
  await window.getByTestId('sidebar-settings').click()
  await window.getByTestId('settings-general-configuration-link').click()
}

export const importWalletUntilCompletionStep = async (window: Page) => {
  const mnemonic = process.env.TEST_MNEMONIC

  await window.getByTestId('welcome-continue').click()
  await window.getByTestId('import-wallet').click()
  await window.getByTestId('security-setup-first-password').fill(PASSWORD)
  await window.getByTestId('security-setup-first-submit').click()
  await window.getByTestId('security-setup-second-password').fill(PASSWORD)
  await window.getByTestId('security-setup-second-submit').click()
  await window.getByTestId('import-wallet-key-textarea').fill(mnemonic)
  await window.getByTestId('import-wallet-key-submit').click()
}

export const importWallet = async (window: Page) => {
  await importWalletUntilCompletionStep(window)
  await window.getByTestId('import-wallet-open-your-wallet').click()

  await sleep(1)
}

export const loginWithKey = async (window: Page, address: string) => {
  await window.getByTestId('welcome-continue').click()
  await window.getByTestId('welcome-tab-key').click()

  await window.getByTestId('login-key-textarea').fill(address)
  await window.getByTestId('login-key-submit').click()

  await sleep(1)
}

export const loginWithEncryptedKey = async (window: Page, encryptedKey: string, password: string) => {
  await window.getByTestId('welcome-continue').click()
  await window.getByTestId('welcome-tab-key').click()

  await window.getByTestId('login-key-textarea').fill(encryptedKey)
  await window.getByTestId('login-key-submit').click()

  await sleep(1)

  await window.getByTestId('login-encrypted-key-password').fill(password)
  await window.getByTestId('login-encrypted-key-decrypt-submit').click()

  await sleep(5)
}

export const logout = async (window: Page) => {
  await window.getByTestId('logout-button').click()
  await sleep(1)
}

export const startFromScratchAndLogout = async (window: Page) => {
  await createNewWallet(window)
  await logout(window)
}

export const createContact = async (
  window: Page,
  { contactName = 'My contact', address = ADDRESSES[0], blockchainName = 'Neo 3' }: TCreateContact = {}
) => {
  const url = window.url()
  if (!url.includes('/contacts')) {
    await window.getByTestId('sidebar-link-contacts').click()
  }

  await window.getByTestId('more-button').click()
  await window.getByTestId('add-contact-button').click()

  await window.getByTestId('input-contact-name').fill(contactName)

  await window.getByTestId('add-more-contact-button').click()

  await window.getByTestId('contact-blockchain-select').click()
  await window.getByTestId('contact-blockchain-select-item').filter({ hasText: blockchainName }).click()

  await window.getByTestId('contact-address-or-domain-input').fill(address)

  await window.getByTestId('save-contact-address-button').click()

  await window.getByTestId('save-contact-button').click()
}
