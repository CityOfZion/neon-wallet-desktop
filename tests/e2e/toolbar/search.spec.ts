import { expect, Page, test } from '@playwright/test'

import { createNewWallet, launch } from '../index'

test.describe('Search button', () => {
  let window: Page

  test.beforeEach(async () => {
    window = await launch()

    await createNewWallet(window)
  })

  test.afterEach(async () => {
    await window.close()
  })

  test('Should be able to open the search modal by button', async () => {
    await window.getByTestId('search-button').click()

    const searchModal = window.getByTestId('search-modal')

    await expect(searchModal).toBeVisible()
  })

  test('Should be able to open the search modal by hotkey', async () => {
    await window.keyboard.press('Control+K')

    const searchModal = window.getByTestId('search-modal')

    await expect(searchModal).toBeVisible()

    await window.keyboard.press('Control+K')

    await expect(searchModal).not.toBeVisible()
  })

  test('Should be able to search', async () => {
    await window.getByTestId('search-button').click()

    await window.getByTestId('search-input').fill('How to create a wallet?')

    const firstSearchItem = window.getByTestId('search-item-0')

    await expect(firstSearchItem).toBeVisible()

    await firstSearchItem.click()

    await expect(window.getByTestId('create-wallet-step1-modal')).toBeVisible()
  })
})
