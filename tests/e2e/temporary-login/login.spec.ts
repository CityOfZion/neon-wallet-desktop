import { expect, Page, test } from '@playwright/test'

import { launch, loginWithEncryptedKey, loginWithKey, sleep } from '..'

test.describe('Temporary Login', () => {
  let window: Page

  test.beforeEach(async () => {
    window = await launch()
  })

  test.afterEach(async () => {
    await window.close()
  })

  test('Should be able to login using an address', async () => {
    const address = 'NenPXJNsJoVHT9XH78QVCMZiUmx7HetkXY'

    await loginWithKey(window, address)

    await expect(window.getByTestId('neon-wallet-logo')).toBeVisible()
  })

  test('Should be able to login using a private key', async () => {
    const key = process.env.TEST_NEO3_KEY

    await loginWithKey(window, key)

    const button = window.getByTestId('login-key-select-account-import-all')
    await expect(button).not.toBeDisabled()
    await button.click()

    await expect(window.getByTestId('neon-wallet-logo')).toBeVisible()
  })

  test('Should be able to login using an encrypted key (Neo 3)', async () => {
    const encryptedKey = process.env.TEST_NEO3_ENCRYPTED_KEY
    const password = process.env.TEST_ENCRYPTED_KEY_PASSWORD

    await loginWithEncryptedKey(window, encryptedKey, password)

    const button = window.getByTestId('login-encrypted-key-import-all')

    await expect(button).not.toBeDisabled()

    await button.click()

    await expect(window.getByTestId('neon-wallet-logo')).toBeVisible()
  })

  test('Should be able to import selected accounts from an encrypted key (Neo 3)', async () => {
    const encryptedKey = process.env.TEST_NEO3_ENCRYPTED_KEY
    const password = process.env.TEST_ENCRYPTED_KEY_PASSWORD

    await loginWithEncryptedKey(window, encryptedKey, password)

    const importSelectedButton = window.getByTestId('login-encrypted-key-import-selected')

    await expect(importSelectedButton).not.toBeDisabled()

    await importSelectedButton.click()

    await expect(window.getByTestId('neon-wallet-logo')).toBeVisible()
  })

  test('Should not be able to decrypt when password is wrong (Neo 3)', async () => {
    const encryptedKey = process.env.TEST_NEO3_ENCRYPTED_KEY

    await window.getByTestId('welcome-continue').click()
    await window.getByTestId('welcome-tab-key').click()

    await window.getByTestId('login-key-textarea').fill(encryptedKey)
    await window.getByTestId('login-key-submit').click()

    await sleep(1)

    await window.getByTestId('login-encrypted-key-password').fill('wrong-password')
    await window.getByTestId('login-encrypted-key-decrypt-submit').click()

    await sleep(1)

    await expect(window.getByTestId('login-encrypted-key-password')).toBeVisible()
    await expect(window.getByTestId('login-encrypted-key-import-all')).not.toBeVisible()
  })

  test('Should have the decrypt button disabled when password is empty (Neo 3)', async () => {
    const encryptedKey = process.env.TEST_NEO3_ENCRYPTED_KEY

    await window.getByTestId('welcome-continue').click()
    await window.getByTestId('welcome-tab-key').click()

    await window.getByTestId('login-key-textarea').fill(encryptedKey)
    await window.getByTestId('login-key-submit').click()

    await sleep(1)

    await expect(window.getByTestId('login-encrypted-key-decrypt-submit')).toBeDisabled()
  })

  test('Should be able to login using an encrypted key (Ethereum)', async () => {
    const encryptedKey = process.env.TEST_ETHEREUM_ENCRYPTED_KEY
    const password = process.env.TEST_ENCRYPTED_KEY_PASSWORD

    await loginWithEncryptedKey(window, encryptedKey, password)

    const button = window.getByTestId('login-encrypted-key-import-all')

    await expect(button).not.toBeDisabled()

    await button.click()

    await expect(window.getByTestId('neon-wallet-logo')).toBeVisible()
  })

  test('Should be able to import selected accounts from an encrypted key (Ethereum)', async () => {
    const encryptedKey = process.env.TEST_ETHEREUM_ENCRYPTED_KEY
    const password = process.env.TEST_ENCRYPTED_KEY_PASSWORD

    await loginWithEncryptedKey(window, encryptedKey, password)

    const importSelectedButton = window.getByTestId('login-encrypted-key-import-selected')

    await expect(importSelectedButton).not.toBeDisabled()

    await importSelectedButton.click()

    await expect(window.getByTestId('neon-wallet-logo')).toBeVisible()
  })

  test('Should not be able to decrypt when password is wrong (Ethereum)', async () => {
    const encryptedKey = process.env.TEST_ETHEREUM_ENCRYPTED_KEY

    await window.getByTestId('welcome-continue').click()
    await window.getByTestId('welcome-tab-key').click()

    await window.getByTestId('login-key-textarea').fill(encryptedKey)
    await window.getByTestId('login-key-submit').click()

    await sleep(1)

    await window.getByTestId('login-encrypted-key-password').fill('wrong-password')
    await window.getByTestId('login-encrypted-key-decrypt-submit').click()

    await sleep(1)

    await expect(window.getByTestId('login-encrypted-key-password')).toBeVisible()
    await expect(window.getByTestId('login-encrypted-key-import-all')).not.toBeVisible()
  })

  test('Should have the decrypt button disabled when password is empty (Ethereum)', async () => {
    const encryptedKey = process.env.TEST_ETHEREUM_ENCRYPTED_KEY

    await window.getByTestId('welcome-continue').click()
    await window.getByTestId('welcome-tab-key').click()

    await window.getByTestId('login-key-textarea').fill(encryptedKey)
    await window.getByTestId('login-key-submit').click()

    await sleep(1)

    await expect(window.getByTestId('login-encrypted-key-decrypt-submit')).toBeDisabled()
  })

  test('Should be able to login using an encrypted key (Bitcoin)', async () => {
    const encryptedKey = process.env.TEST_BITCOIN_ENCRYPTED_KEY
    const password = process.env.TEST_ENCRYPTED_KEY_PASSWORD

    await loginWithEncryptedKey(window, encryptedKey, password)

    const button = window.getByTestId('login-encrypted-key-import-all')

    await expect(button).not.toBeDisabled()

    await button.click()

    await expect(window.getByTestId('neon-wallet-logo')).toBeVisible()
  })

  test('Should be able to import selected accounts from an encrypted key (Bitcoin)', async () => {
    const encryptedKey = process.env.TEST_BITCOIN_ENCRYPTED_KEY
    const password = process.env.TEST_ENCRYPTED_KEY_PASSWORD

    await loginWithEncryptedKey(window, encryptedKey, password)

    const importSelectedButton = window.getByTestId('login-encrypted-key-import-selected')

    await expect(importSelectedButton).not.toBeDisabled()

    await importSelectedButton.click()

    await expect(window.getByTestId('neon-wallet-logo')).toBeVisible()
  })

  test('Should not be able to decrypt when password is wrong (Bitcoin)', async () => {
    const encryptedKey = process.env.TEST_BITCOIN_ENCRYPTED_KEY

    await window.getByTestId('welcome-continue').click()
    await window.getByTestId('welcome-tab-key').click()

    await window.getByTestId('login-key-textarea').fill(encryptedKey)
    await window.getByTestId('login-key-submit').click()

    await sleep(1)

    await window.getByTestId('login-encrypted-key-password').fill('wrong-password')
    await window.getByTestId('login-encrypted-key-decrypt-submit').click()

    await sleep(1)

    await expect(window.getByTestId('login-encrypted-key-password')).toBeVisible()
    await expect(window.getByTestId('login-encrypted-key-import-all')).not.toBeVisible()
  })

  test('Should have the decrypt button disabled when password is empty (Bitcoin)', async () => {
    const encryptedKey = process.env.TEST_BITCOIN_ENCRYPTED_KEY

    await window.getByTestId('welcome-continue').click()
    await window.getByTestId('welcome-tab-key').click()

    await window.getByTestId('login-key-textarea').fill(encryptedKey)
    await window.getByTestId('login-key-submit').click()

    await sleep(1)

    await expect(window.getByTestId('login-encrypted-key-decrypt-submit')).toBeDisabled()
  })

  test('Should be able to login using a mnemonic', async () => {
    const mnemonic = process.env.TEST_MNEMONIC

    await loginWithKey(window, mnemonic)

    const button = window.getByTestId('login-key-select-account-import-all')
    await expect(button).not.toBeDisabled()
    await button.click()

    await expect(window.getByTestId('neon-wallet-logo')).toBeVisible()
  })

  test('Should not be able to login when the input is invalid', async () => {
    await window.getByTestId('welcome-continue').click()
    await window.getByTestId('welcome-tab-key').click()

    const invalidText = 'INVALID TEXT'

    await window.getByTestId('login-key-textarea').fill(invalidText)

    await expect(window.getByTestId('login-key-submit')).toBeDisabled()
  })

  test('Should not be able to access non temporary features', async () => {
    const address = 'NenPXJNsJoVHT9XH78QVCMZiUmx7HetkXY'

    await loginWithKey(window, address)

    const moreButton = window.getByTestId('more-button')
    await expect(moreButton).toBeVisible()
    await moreButton.click()

    await expect(window.getByTestId('new-wallet-button')).toBeDisabled()

    await window.getByTestId('sidebar-settings').click()

    await window.getByTestId('settings-tab-security').click()

    await expect(window.getByTestId('settings-change-password-button')).toHaveAttribute('aria-disabled', 'true')
    await expect(window.getByTestId('settings-recover-wallet-button')).toHaveAttribute('aria-disabled', 'true')
    await expect(window.getByTestId('settings-backup-wallet-button')).toHaveAttribute('aria-disabled', 'true')
    await expect(window.getByTestId('settings-migrate-wallet-button')).toHaveAttribute('aria-disabled', 'true')
  })
})
