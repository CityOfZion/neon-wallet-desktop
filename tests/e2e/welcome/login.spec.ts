import { expect, test } from '@playwright/test'

import { launch, PASSWORD, startFromScratchAndLogout } from '../index'

test.describe('Login with password', () => {
  test('Should be logged when has a correct password', async () => {
    const window = await launch()

    await startFromScratchAndLogout(window)

    await window.getByTestId('login-password-input').fill(PASSWORD)
    await window.getByTestId('login-submit').click()

    await expect(window.getByTestId('neon-wallet-logo')).toBeVisible()

    await window.close()
  })

  test('Should be disabled on init', async () => {
    const window = await launch()

    await startFromScratchAndLogout(window)

    await expect(window.getByTestId('login-submit')).toBeDisabled()

    await window.close()
  })

  test('Should be disabled and show input error message when password is wrong', async () => {
    const window = await launch()

    await startFromScratchAndLogout(window)

    await window.getByTestId('login-password-input').fill('WRONG_PASSWORD')
    await window.getByTestId('login-submit').click()

    await expect(window.getByTestId('login-password-input-error')).toBeVisible()
    await expect(window.getByTestId('login-submit')).toBeDisabled()

    await window.close()
  })
})
