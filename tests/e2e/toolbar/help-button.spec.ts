import { expect, Locator, Page, test } from '@playwright/test'

import { createNewWallet, launch } from '../index'

test.describe('Help button', () => {
  let window: Page
  let helpButton: Locator

  test.beforeEach(async () => {
    window = await launch()

    await createNewWallet(window)

    helpButton = window.getByTestId('help-button')
  })

  test.afterEach(async () => {
    await window.close()
  })

  test('Should not show the popover', async () => {
    await expect(window.getByTestId('help-content')).not.toBeVisible()
  })

  test('Should click on "Help" button and open the popover', async () => {
    await expect(helpButton).toBeVisible()

    await helpButton.click()

    await expect(window.getByTestId('help-content')).toBeVisible()
  })

  // Skipped because it opens a link in the browser every time
  test.skip('Should click on "Chat with us" button and open the Discord link on browser', async () => {
    await expect(helpButton).toBeVisible()

    await helpButton.click()

    await window.getByTestId('help-chat-with-us').click()
  })
})
