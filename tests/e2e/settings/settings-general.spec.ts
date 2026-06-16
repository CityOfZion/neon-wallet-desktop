import { expect, Page, test } from '@playwright/test'

import { createNewWallet, launch, navigateToGeneralSettings } from '../index'

test.describe('Settings General', () => {
  let window: Page

  test.beforeEach(async () => {
    window = await launch()
    await createNewWallet(window)
    await navigateToGeneralSettings(window)
  })

  test.afterEach(async () => {
    await window.close()
  })

  test('Should display the General settings page title', async () => {
    await expect(window.getByTestId('settings-layout-title')).toContainText('General')
  })

  test('Should display the "Ask for password to confirm actions" checkbox for password login', async () => {
    await expect(window.locator('#should-confirm-action')).toBeVisible()
  })

  test('Should have the checkbox checked by default for password login', async () => {
    await expect(window.locator('#should-confirm-action')).toBeChecked()
  })

  test('Should uncheck the "Ask for password to confirm actions" checkbox', async () => {
    await window.locator('#should-confirm-action').click()

    await expect(window.locator('#should-confirm-action')).not.toBeChecked()
  })

  test('Should re-check the checkbox after unchecking', async () => {
    await window.locator('#should-confirm-action').click()
    await window.locator('#should-confirm-action').click()

    await expect(window.locator('#should-confirm-action')).toBeChecked()
  })

  test('Should persist the unchecked state after navigating away and back', async () => {
    await window.locator('#should-confirm-action').click()
    await expect(window.locator('#should-confirm-action')).not.toBeChecked()

    await window.getByTestId('settings-language-configuration-link').click()
    await window.getByTestId('settings-general-configuration-link').click()

    await expect(window.locator('#should-confirm-action')).not.toBeChecked()
  })
})
