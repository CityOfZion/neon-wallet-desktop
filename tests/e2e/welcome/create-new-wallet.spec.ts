import { expect, test } from '@playwright/test'

import { createNewWallet, launch, PASSWORD } from '../index'

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
})
