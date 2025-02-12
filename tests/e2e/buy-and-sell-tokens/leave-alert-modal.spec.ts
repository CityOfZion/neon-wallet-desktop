import { expect, Page, test } from '@playwright/test'

import { createNewWallet, launch } from '../index'

test.describe('Leave Alert Modal', () => {
  let window: Page

  test.beforeEach(async () => {
    window = await launch()

    await createNewWallet(window)

    await window.getByTestId('sidebar-link-buy-and-sell-tokens').click()

    await window.getByTestId('sidebar-link-wallets').click()
  })

  test.afterEach(async () => {
    await window.close()
  })

  test('Should show the Leave Alert Modal when click in a link to leave from Buy & Sell Tokens screen', async () => {
    await expect(window.getByTestId('buy-and-sell-tokens-leave-alert-modal')).toBeVisible()
  })

  test('Should keep in Buy & Sell Tokens screen if clicks on close button', async () => {
    await window.getByTestId('buy-and-sell-tokens-leave-alert-close-button').click()

    await expect(window.getByTestId('buy-and-sell-tokens-leave-alert-modal')).not.toBeVisible()
    await expect(window.getByTestId('buy-tokens-content-layout')).toBeVisible()
  })

  test('Should continue to Wallets screen if clicks on continue button', async () => {
    await window.getByTestId('buy-and-sell-tokens-leave-alert-continue-button').click()

    await expect(window.getByTestId('buy-and-sell-tokens-leave-alert-modal')).not.toBeVisible()
    await expect(window.getByTestId('wallets-screen')).toBeVisible()
  })
})
