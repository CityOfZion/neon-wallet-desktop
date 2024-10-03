import { expect, test } from '@playwright/test'

import { createContact, createNewWallet, launch } from '../index'

test.describe('List contacts', () => {
  test('Should list created contacts', async () => {
    const window = await launch()
    const firstContact = 'Contact 1'
    const secondContact = 'My contact 2'

    await createNewWallet(window)
    await createContact(window, { contactName: firstContact })
    await createContact(window, { contactName: secondContact })

    await expect(window.getByTestId('contacts-list')).toContainText(firstContact)
    await expect(window.getByTestId('contacts-list')).toContainText(secondContact)

    await window.close()
  })

  test('Should search contact', async () => {
    const window = await launch()
    const contactName = 'Lorem Ipsum Contact'

    await createNewWallet(window)
    await createContact(window, { contactName })

    await window.getByTestId('search-contact-input').fill('ipsum cont')

    await expect(window.getByTestId('contacts-list')).toContainText(contactName)

    await window.getByTestId('search-contact-input').fill('IPSUM CONT')

    await expect(window.getByTestId('contacts-list')).toContainText(contactName)

    await window.close()
  })

  test('Should show not found when search invalid contact', async () => {
    const window = await launch()
    const contactName = 'Contact'

    await createNewWallet(window)
    await createContact(window, { contactName })

    await window.getByTestId('search-contact-input').fill('Invalid contact')

    await expect(window.getByTestId('contacts-list')).not.toContainText(contactName)
    await expect(window.getByTestId('contacts-not-found')).toBeVisible()

    await window.close()
  })
})
