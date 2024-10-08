import { expect, test } from '@playwright/test'

import { launch, loginWithKey, logout } from '..'

test.describe('Temporary data', () => {
  test('Should be able to remove all temporary data when logout', async () => {
    const window = await launch()

    const address = process.env.TEST_NEO3_ADDRESS
    if (!address) throw new Error('TEST_NEO3_ADDRESS is not defined')

    await loginWithKey(window, address)

    await logout(window)

    const authReducerJson = await window.evaluate(() => localStorage.getItem('persist:authReducer'))

    expect(authReducerJson).toBeTruthy()

    const authReducer = JSON.parse(JSON.parse(authReducerJson!).data)

    expect(authReducer.applicationDataByLoginType.key.wallets).toHaveLength(0)

    await window.close()
  })

  test('Should be able to remove all temporary data when app starts', async () => {
    const window = await launch()

    const address = process.env.TEST_NEO3_ADDRESS
    if (!address) throw new Error('TEST_NEO3_ADDRESS is not defined')

    await loginWithKey(window, address)

    await window.close()

    const anotherWindow = await launch(false)

    const authReducerJson = await anotherWindow.evaluate(() => localStorage.getItem('persist:authReducer'))
    expect(authReducerJson).toBeTruthy()
    const authReducer = JSON.parse(JSON.parse(authReducerJson!).data)
    expect(authReducer.applicationDataByLoginType.key.wallets).toHaveLength(0)

    await anotherWindow.close()
  })
})
