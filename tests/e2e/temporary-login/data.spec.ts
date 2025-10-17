import { expect, test } from '@playwright/test'

import { launch, loginWithKey, logout, sleep } from '..'

test.describe('Temporary data', () => {
  test('Should be able to remove all temporary data when logout', async () => {
    const window = await launch()

    const address = 'NenPXJNsJoVHT9XH78QVCMZiUmx7HetkXY'

    await loginWithKey(window, address)

    await logout(window)

    await window.waitForTimeout(1000)

    const authReducerJson = await window.evaluate(() => localStorage.getItem('persist:authReducer'))

    expect(authReducerJson).toBeTruthy()

    const authReducer = JSON.parse(JSON.parse(authReducerJson!).data)

    expect(authReducer.applicationDataByLoginType.key.wallets).toHaveLength(0)

    await window.close()
  })

  test('Should be able to remove all temporary data when app starts', async () => {
    const window = await launch()

    const address = 'NenPXJNsJoVHT9XH78QVCMZiUmx7HetkXY'

    await loginWithKey(window, address)

    await window.close()

    const anotherWindow = await launch(false)

    await sleep(1)

    const authReducerJson = await anotherWindow.evaluate(() => localStorage.getItem('persist:authReducer'))
    expect(authReducerJson).toBeTruthy()
    const authReducer = JSON.parse(JSON.parse(<string>authReducerJson!).data)
    expect(authReducer.applicationDataByLoginType.key.wallets).toHaveLength(0)

    await anotherWindow.close()
  })
})
