import { expect, test } from '@playwright/test'

import playwrightConfig from '../../../playwright.config'
import { createNewWallet, launch } from '../index'

test.describe('Focus lock', () => {
  test('Should maintain the focus in modal', async () => {
    const window = await launch()

    await createNewWallet(window)

    await window.getByTestId('sidebar-link-wallets').click()
    await window.getByTestId('connect-hardware-wallet').click()

    await window.press('html', 'Tab')
    await window.press('html', 'Tab')
    await window.press('html', 'Tab')
    await window.press('html', 'Tab')

    const focusedElement = await window.evaluateHandle(() => document.activeElement)

    await expect(await focusedElement.getAttribute(playwrightConfig.use.testIdAttribute)).toBe('center-modal-close')

    await window.close()
  })
})
