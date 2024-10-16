import { expect, test } from '@playwright/test'

import { createContact, createNewWallet, launch } from '../index'

test.describe('Read contact', () => {
  test('Should read a selected contact', async () => {
    const window = await launch()
    const contactName = 'My contact name'
    const address = 'NenPXJNsJoVHT9XH78QVCMZiUmx7HetkXY'
    const blockchainName = 'Neo N3'

    await createNewWallet(window)
    await createContact(window, { contactName, address, blockchainName })

    await window.getByTestId('contact-list-item').click()

    await expect(window.getByTestId('contact-name-title')).toContainText(contactName)
    await expect(window.getByTestId('address-column-cell')).toContainText(address)
    await expect(window.getByTestId('blockchain-column-cell')).toContainText(blockchainName)

    await window.close()
  })

  test('Should copy the address to clipboard', async () => {
    const window = await launch()
    const address = 'NenPXJNsJoVHT9XH78QVCMZiUmx7HetkXY'

    await createNewWallet(window)
    await createContact(window, { address })

    await window.getByTestId('contact-list-item').click()
    await window.getByTestId('copy-address-button').click()

    const copiedAddress = await window.evaluate(() => navigator.clipboard.readText())

    expect(copiedAddress).toBe(address)

    await expect(window.getByTestId('toast')).toBeVisible()

    await window.close()
  })

  test('Should go to send screen and has the contact as recipient when click on "Send assets" button', async () => {
    const window = await launch()
    const address = 'NenPXJNsJoVHT9XH78QVCMZiUmx7HetkXY'

    await createNewWallet(window)
    await createContact(window, { address })

    await window.getByTestId('contact-list-item').click()
    await window.getByTestId('send-assets-button').click()

    expect(await window.getByTestId('send-recipient-address-input-1').inputValue()).toBe(address)

    await window.close()
  })
})
