import { expect, test } from '@playwright/test'

import { createContact, createNewWallet, launch } from '../index'

test.describe('Delete contact', () => {
  test('Should delete contact', async () => {
    const window = await launch()
    const contactName = 'Best contact'

    await createNewWallet(window)
    await createContact(window, { contactName })

    await window.getByTestId('contact-list-item').click()
    await window.getByTestId('edit-contact-button').click()
    await window.getByTestId('delete-contact-button').click()
    await window.getByTestId('delete-button').click()

    await expect(window.getByTestId('contacts-list')).not.toContainText(contactName)

    await window.close()
  })

  test('Should delete contact address', async () => {
    const window = await launch()

    await createNewWallet(window)
    await createContact(window)

    await window.getByTestId('contact-list-item').click()
    await window.getByTestId('edit-contact-button').click()
    await window.getByTestId('delete-contact-address-button').click()
    await window.getByTestId('delete-button').click()

    await expect(window.getByTestId('not-found-contact-address')).toBeVisible()
    await expect(window.getByTestId('error-message-contact-address')).toBeVisible()

    await window.close()
  })
})
