import { expect, test } from '@playwright/test'

import { ADDRESSES, createNewWallet, launch } from '../index'

test.describe('Create contact', () => {
  test('Should create a contact', async () => {
    const window = await launch()
    const blockchainName = 'Neo N3'
    const contactName = 'My first contact'

    await createNewWallet(window)

    await window.getByTestId('sidebar-link-contacts').click()
    await window.getByTestId('add-contact-action').click()

    await window.getByTestId('input-contact-name').fill(contactName)

    await window.getByTestId('add-more-contact-button').click()

    await window.getByTestId('contact-blockchain-select').click()
    await window.getByTestId('contact-blockchain-select-item').filter({ hasText: blockchainName }).click()

    await window.getByTestId('contact-address-or-domain-input').fill(ADDRESSES[0])

    await expect(window.getByTestId('address-or-domain-success-message')).toBeVisible()
    await expect(window.getByTestId('save-contact-address-button')).not.toBeDisabled()

    await window.getByTestId('save-contact-address-button').click()

    await expect(window.getByTestId('contact-address-text').first()).toContainText(ADDRESSES[0])

    await window.getByTestId('add-more-contact-button').click()

    await window.getByTestId('contact-blockchain-select').click()
    await window.getByTestId('contact-blockchain-select-item').filter({ hasText: blockchainName }).click()

    await window.getByTestId('contact-address-or-domain-input').fill(ADDRESSES[1])

    await expect(window.getByTestId('address-or-domain-success-message')).toBeVisible()
    await expect(window.getByTestId('save-contact-address-button')).not.toBeDisabled()

    await window.getByTestId('save-contact-address-button').click()

    await expect(window.getByTestId('contact-address-text').nth(1)).toContainText(ADDRESSES[1])

    await window.getByTestId('save-contact-button').click()

    await expect(window.getByTestId('contacts-list')).toContainText(contactName)

    await window.close()
  })

  test('Should be disabled buttons and show not found message without name', async () => {
    const window = await launch()

    await createNewWallet(window)

    await window.getByTestId('sidebar-link-contacts').click()
    await window.getByTestId('add-contact-action').click()

    await expect(window.getByTestId('not-found-contact-address')).toBeVisible()
    await expect(window.getByTestId('add-more-contact-button')).toBeDisabled()
    await expect(window.getByTestId('save-contact-button')).toBeDisabled()

    await window.close()
  })

  test('Should be disabled and show error message without contact blockchain and address', async () => {
    const window = await launch()

    await createNewWallet(window)

    await window.getByTestId('sidebar-link-contacts').click()
    await window.getByTestId('add-contact-action').click()

    await window.getByTestId('input-contact-name').fill('Contact')

    await window.getByTestId('add-more-contact-button').click()

    await expect(window.getByTestId('save-contact-address-button')).toBeDisabled()

    await window.getByTestId('contact-blockchain-select').click()
    await window.getByTestId('contact-blockchain-select-item').filter({ hasText: 'Neo N3' }).click()

    await expect(window.getByTestId('save-contact-address-button')).toBeDisabled()

    await window.getByTestId('contact-address-or-domain-input').fill('Invalid address or domain')

    await expect(window.getByTestId('address-or-domain-error-message')).toBeVisible()
    await expect(window.getByTestId('save-contact-address-button')).toBeDisabled()

    await window.close()
  })
})
