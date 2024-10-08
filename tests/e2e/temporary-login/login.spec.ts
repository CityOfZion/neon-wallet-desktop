import { expect, test } from '@playwright/test'

import { launch, loginWithKey } from '../index'

test.describe('Temporary Login', () => {
  test('Should be able to login using an address', async () => {
    const window = await launch()
    const address = process.env.TEST_NEO3_ADDRESS
    if (!address) throw new Error('TEST_NEO3_ADDRESS is not defined')

    await loginWithKey(window, address)

    await expect(window.getByTestId('neon-wallet-logo')).toBeVisible()

    await window.close()
  })

  test('Should be able to login using a private key', async () => {
    const window = await launch()
    const key = process.env.TEST_NEO3_KEY
    if (!key) throw new Error('TEST_NEO3_KEY is not defined')

    await loginWithKey(window, key)

    const button = window.getByTestId('login-key-select-account-import-all')
    await expect(button).not.toBeDisabled()
    await button.click()

    await expect(window.getByTestId('neon-wallet-logo')).toBeVisible()

    await window.close()
  })

  test('Should be able to login using a mnemonic', async () => {
    const window = await launch()

    const mnemonic = process.env.TEST_MNEMONIC
    if (!mnemonic) throw new Error('TEST_NEO3_KEY is not defined')

    await loginWithKey(window, mnemonic)

    const button = window.getByTestId('login-key-select-account-import-all')
    await expect(button).not.toBeDisabled()
    await button.click()

    await expect(window.getByTestId('neon-wallet-logo')).toBeVisible()

    await window.close()
  })

  test('Should not be able to login when the input is invalid', async () => {
    const window = await launch()

    await window.getByTestId('welcome-continue').click()
    await window.getByTestId('welcome-tab-key').click()

    const invalidText = 'INVALID TEXT'

    await window.getByTestId('login-key-textarea').fill(invalidText)

    await expect(window.getByTestId('login-key-submit')).toBeDisabled()

    await window.close()
  })

  test('Should not be able to access non temporary features', async () => {
    const window = await launch()
    const address = process.env.TEST_NEO3_ADDRESS
    if (!address) throw new Error('TEST_NEO3_ADDRESS is not defined')

    await loginWithKey(window, address)

    await expect(window.getByTestId('portfolio-new-wallet-button')).toBeDisabled()

    await window.getByTestId('sidebar-settings').click()

    await window.getByTestId('settings-tab-security').click()

    await expect(window.getByTestId('settings-change-password-button')).toHaveAttribute('aria-disabled', 'true')
    await expect(window.getByTestId('settings-recover-wallet-button')).toHaveAttribute('aria-disabled', 'true')
    await expect(window.getByTestId('settings-backup-wallet-button')).toHaveAttribute('aria-disabled', 'true')
    await expect(window.getByTestId('settings-migrate-wallet-button')).toHaveAttribute('aria-disabled', 'true')

    await window.close()
  })
})
