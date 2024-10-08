import { Page } from '@playwright/test'
import { _electron as electron } from 'playwright-core'

import { TCreateContact } from './types'

export const PASSWORD = '.7g/7i*Vcf%V3:9Ls3AAt3;i'
export const ADDRESSES = ['NRwXs5yZRMuuXUo7AqvetHQ4GDHe3pV7Mb', 'NcuusM86eJ1u1FKxh2qUUpfsQ1kgjZqNrf']

export const launch = async (shouldResetStorage = true) => {
  const electronApp = await electron.launch({ args: ['.', '--no-sandbox'] })
  const window = await electronApp.firstWindow()

  if (shouldResetStorage) {
    await window.evaluate('window.localStorage.clear()')
  }

  await window.reload({ waitUntil: 'load' })

  return window
}

export const sleep = (seconds: number): Promise<void> => new Promise(resolve => setTimeout(resolve, seconds * 1000))

export const createNewWallet = async (window: Page) => {
  await window.getByTestId('welcome-continue').click()
  await window.getByTestId('create-new-wallet').click()
  await window.getByTestId('security-setup-first-password').fill(PASSWORD)
  await window.getByTestId('security-setup-first-submit').click()
  await window.getByTestId('security-setup-second-password').fill(PASSWORD)
  await window.getByTestId('security-setup-second-submit').click()
  await window.getByTestId('security-setup-open-your-wallet').click()
}

export const loginWithKey = async (window: Page, address: string) => {
  await window.getByTestId('welcome-continue').click()
  await window.getByTestId('welcome-tab-key').click()

  await window.getByTestId('login-key-textarea').fill(address)
  await window.getByTestId('login-key-submit').click()
}

export const logout = async (window: Page) => {
  await window.getByTestId('logout-button').click()
}

export const startFromScratchAndLogout = async (window: Page) => {
  await createNewWallet(window)
  await logout(window)
}

export const createContact = async (
  window: Page,
  { contactName = 'My contact', address = ADDRESSES[0], blockchainName = 'Neo N3' }: TCreateContact = {}
) => {
  await window.getByTestId('sidebar-link-contacts').click()
  await window.getByTestId('add-contact-action').click()

  await window.getByTestId('input-contact-name').fill(contactName)

  await window.getByTestId('add-more-contact-button').click()

  await window.getByTestId('contact-blockchain-select').click()
  await window.getByTestId('contact-blockchain-select-item').filter({ hasText: blockchainName }).click()

  await window.getByTestId('contact-address-or-domain-input').fill(address)

  await window.getByTestId('save-contact-address-button').click()

  await window.getByTestId('save-contact-button').click()
}
