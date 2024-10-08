import { expect, test } from '@playwright/test'

import { ADDRESSES, createContact, createNewWallet, launch } from '../index'

test.describe('Edit contact', () => {
  test('Should edit contact name', async () => {
    const window = await launch()
    const editedContactName = 'Edited contact'

    await createNewWallet(window)
    await createContact(window, { contactName: 'Contact' })

    await window.getByTestId('contact-list-item').click()
    await window.getByTestId('edit-contact-button').click()

    await window.getByTestId('input-contact-name').fill(editedContactName)

    await window.getByTestId('save-contact-button').click()

    await expect(window.getByTestId('contact-name-title')).toContainText(editedContactName)
    await expect(window.getByTestId('contacts-list')).toContainText(editedContactName)

    await window.close()
  })

  test('Should edit contact address', async () => {
    const window = await launch()
    const contactName = 'My contact'
    const [address, updatedAddress] = ADDRESSES
    const blockchainName = 'Neo N3'

    await createNewWallet(window)
    await createContact(window, { contactName, address, blockchainName })

    await window.getByTestId('contact-list-item').click()
    await window.getByTestId('edit-contact-button').click()
    await window.getByTestId('edit-contact-address-button').click()

    await expect(window.getByTestId('contact-blockchain-select')).toContainText(blockchainName)

    expect(await window.getByTestId('contact-address-or-domain-input').inputValue()).toBe(address)

    await window.getByTestId('contact-address-or-domain-input').fill(updatedAddress)

    await expect(window.getByTestId('address-or-domain-success-message')).toBeVisible()
    await expect(window.getByTestId('save-contact-address-button')).not.toBeDisabled()

    await window.getByTestId('save-contact-address-button').click()

    await expect(window.getByTestId('contact-address-text').first()).toContainText(updatedAddress)

    await window.getByTestId('save-contact-button').click()

    await expect(window.getByTestId('address-column-cell').first()).toContainText(updatedAddress)

    await window.close()
  })

  test('Should init edit contact address disabled', async () => {
    const window = await launch()

    await createNewWallet(window)
    await createContact(window)

    await window.getByTestId('contact-list-item').click()
    await window.getByTestId('edit-contact-button').click()
    await window.getByTestId('edit-contact-address-button').click()

    await expect(window.getByTestId('save-contact-address-button')).toBeDisabled()

    await window.close()
  })

  test('Should show error message when change with invalid blockchain on edit contact address', async () => {
    const window = await launch()

    await createNewWallet(window)
    await createContact(window)

    await window.getByTestId('contact-list-item').click()
    await window.getByTestId('edit-contact-button').click()
    await window.getByTestId('edit-contact-address-button').click()

    await window.getByTestId('contact-blockchain-select').click()
    await window.getByTestId('contact-blockchain-select-item').filter({ hasText: 'Neo Legacy' }).click()

    await expect(window.getByTestId('address-or-domain-error-message')).toBeVisible()

    await window.close()
  })

  test('Should add a new contact address', async () => {
    const window = await launch()
    const blockchainName = 'Neo N3'
    const address = 'NVtKNQ6sniG61h5gnhZSZxdfXRUcEu5WMn'

    await createNewWallet(window)
    await createContact(window)

    await window.getByTestId('contact-list-item').click()
    await window.getByTestId('edit-contact-button').click()
    await window.getByTestId('add-more-contact-button').click()

    await window.getByTestId('contact-blockchain-select').click()
    await window.getByTestId('contact-blockchain-select-item').filter({ hasText: blockchainName }).click()

    await window.getByTestId('contact-address-or-domain-input').fill(address)

    await expect(window.getByTestId('address-or-domain-success-message')).toBeVisible()
    await expect(window.getByTestId('save-contact-address-button')).not.toBeDisabled()

    await window.getByTestId('save-contact-address-button').click()

    await expect(window.getByTestId('contact-address-text').nth(1)).toContainText(address)

    await window.getByTestId('save-contact-button').click()

    await expect(window.getByTestId('address-column-cell').nth(1)).toContainText(address)
    await expect(window.getByTestId('blockchain-column-cell').nth(1)).toContainText(blockchainName)

    await window.close()
  })
})
