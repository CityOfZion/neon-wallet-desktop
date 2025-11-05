import { expect, test } from '@playwright/test'

import playwrightConfig from '../../../playwright.config'
import { createNewWallet, launch } from '../index'

test.describe('Focus lock', () => {
  test('Should maintain the focus in modal', async () => {
    const window = await launch()

    await createNewWallet(window)

    await window.getByTestId('sidebar-link-wallets').click()
    await window.getByTestId('more-button').click()
    await window.getByTestId('connect-hardware-wallet-button').click()

    await window.waitForTimeout(1000)

    await window.keyboard.press('Tab')

    await window.waitForTimeout(1000)

    const focusedElement = await window.evaluateHandle(() => document.activeElement)
    const testId = await focusedElement.evaluate(
      (element, testIdAttribute) => element?.getAttribute(testIdAttribute),
      playwrightConfig.use!.testIdAttribute!
    )

    expect(testId).toBe('center-modal-close-button')
  })
})
