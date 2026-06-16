import { expect, test } from '@playwright/test'

import {
  createNewWallet,
  createWalletUntilCompletionStep,
  importWalletUntilCompletionStep,
  launch,
  navigateToGeneralSettings,
  PASSWORD,
} from '../index'

test.describe('Create new wallet', () => {
  test('Should create a new wallet when pass in all steps', async () => {
    const window = await launch()

    await createNewWallet(window)

    await expect(window.getByTestId('neon-wallet-logo')).toBeVisible()

    await window.close()
  })

  test('Should be disabled on init the first step', async () => {
    const window = await launch()

    await window.getByTestId('welcome-continue').click()
    await window.getByTestId('create-new-wallet').click()

    await expect(window.getByTestId('security-setup-first-submit')).toBeDisabled()

    await window.close()
  })

  test('Should be disabled and show input error message if there are not at least 4 chars in the first step', async () => {
    const window = await launch()

    await window.getByTestId('welcome-continue').click()
    await window.getByTestId('create-new-wallet').click()
    await window.getByTestId('security-setup-first-password').fill('H!9')

    await expect(window.getByTestId('security-setup-first-password-error')).toBeVisible()
    await expect(window.getByTestId('security-setup-first-submit')).toBeDisabled()

    await window.close()
  })

  test('Should be disabled on init the second step', async () => {
    const window = await launch()

    await window.getByTestId('welcome-continue').click()
    await window.getByTestId('create-new-wallet').click()
    await window.getByTestId('security-setup-first-password').fill(PASSWORD)
    await window.getByTestId('security-setup-first-submit').click()

    await expect(window.getByTestId('security-setup-second-submit')).toBeDisabled()

    await window.close()
  })

  test("Should be disabled and show input error message if it doesn't have the same password in the second step", async () => {
    const window = await launch()

    await window.getByTestId('welcome-continue').click()
    await window.getByTestId('create-new-wallet').click()
    await window.getByTestId('security-setup-first-password').fill(PASSWORD)
    await window.getByTestId('security-setup-first-submit').click()
    await window.getByTestId('security-setup-second-password').fill(`${PASSWORD}a`)

    await expect(window.getByTestId('security-setup-second-password-error')).toBeVisible()
    await expect(window.getByTestId('security-setup-second-submit')).toBeDisabled()

    await window.close()
  })

  test('Should create a wallet with accounts for each chain', async () => {
    const window = await launch()

    await createNewWallet(window)

    const accountsLength = await window.getByTestId('accounts-wallet-list').locator('> li').count()

    expect(accountsLength).toBeGreaterThan(1)

    await window.close()
  })

  test('Should display the "Ask for password to confirm actions" checkbox on the completion step', async () => {
    const window = await launch()

    await createWalletUntilCompletionStep(window)

    await expect(window.locator('#should-confirm-action')).toBeVisible()

    await window.close()
  })

  test('Should have the "Ask for password to confirm actions" checkbox checked by default on the completion step', async () => {
    const window = await launch()

    await createWalletUntilCompletionStep(window)

    await expect(window.locator('#should-confirm-action')).toBeChecked()

    await window.close()
  })

  test('Should allow toggling the "Ask for password to confirm actions" checkbox on the completion step', async () => {
    const window = await launch()

    await createWalletUntilCompletionStep(window)

    const checkbox = window.locator('#should-confirm-action')

    await checkbox.click()
    await expect(checkbox).not.toBeChecked()

    await checkbox.click()
    await expect(checkbox).toBeChecked()

    await window.close()
  })
})

test.describe('Checkbox "Ask for password to confirm actions" persistence in settings', () => {
  test('Should persist checked state in settings after importing a wallet', async () => {
    const window = await launch()

    await importWalletUntilCompletionStep(window)
    await expect(window.locator('#should-confirm-action')).toBeChecked()
    await window.getByTestId('import-wallet-open-your-wallet').click()
    await navigateToGeneralSettings(window)

    await expect(window.locator('#should-confirm-action')).toBeChecked()

    await window.close()
  })

  test('Should persist checked state in settings after creating a wallet', async () => {
    const window = await launch()

    await createWalletUntilCompletionStep(window)
    await expect(window.locator('#should-confirm-action')).toBeChecked()
    await window.getByTestId('security-setup-open-your-wallet').click()
    await navigateToGeneralSettings(window)

    await expect(window.locator('#should-confirm-action')).toBeChecked()

    await window.close()
  })

  test('Should persist unchecked state in settings after importing a wallet', async () => {
    const window = await launch()

    await importWalletUntilCompletionStep(window)
    await window.locator('#should-confirm-action').click()
    await window.getByTestId('import-wallet-open-your-wallet').click()
    await navigateToGeneralSettings(window)

    await expect(window.locator('#should-confirm-action')).not.toBeChecked()

    await window.close()
  })

  test('Should persist unchecked state in settings after creating a wallet', async () => {
    const window = await launch()

    await createWalletUntilCompletionStep(window)
    await window.locator('#should-confirm-action').click()
    await window.getByTestId('security-setup-open-your-wallet').click()
    await navigateToGeneralSettings(window)

    await expect(window.locator('#should-confirm-action')).not.toBeChecked()

    await window.close()
  })
})
