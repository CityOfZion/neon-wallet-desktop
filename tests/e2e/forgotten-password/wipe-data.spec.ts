import { expect, test } from '@playwright/test'

import { launch, startFromScratchAndLogout } from '../index'

test.describe('Wipe data', () => {
  test('Should clean data when flow wipe data', async () => {
    const window = await launch()

    await startFromScratchAndLogout(window)

    await window.getByTestId('login-forgot-password').click()
    await window.getByTestId('forgotten-password-continue').click()
    await window.getByTestId('forgotten-password-confirm').press('Enter')
    await window.getByTestId('forgotten-password-success-go-to-welcome').click()

    await expect(window.getByTestId('neon-account-container')).toBeVisible()

    await window.close()
  })
})
