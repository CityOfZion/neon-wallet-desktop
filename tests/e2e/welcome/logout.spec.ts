import { expect, test } from '@playwright/test'

import { launch, startFromScratchAndLogout } from '../index'

test.describe('Logout', () => {
  test('Should be unlogged when click in logout button', async () => {
    const window = await launch()

    await startFromScratchAndLogout(window)

    await expect(window.getByTestId('login-container')).toBeVisible()

    await window.close()
  })
})
