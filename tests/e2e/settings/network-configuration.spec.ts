import { expect, Page, test } from '@playwright/test'

import { createNewWallet, launch } from '../index'

const testnetName = 'Testnet'

const createAndSelectProfile = async (window: Page, profileName: string) => {
  await window.getByTestId('network-profile-actions-button').click()
  await window.getByTestId('network-profile-actions-create').click()

  await window.getByTestId('add-network-profile-name').fill(profileName)
  await window.getByTestId('add-network-profile-save').click()

  await window.getByTestId('network-profile-select').click()
  await window.getByTestId('network-profile-select-item').filter({ hasText: profileName }).click()
}

test.describe('Network Configuration', () => {
  let window: Page

  test.beforeEach(async () => {
    window = await launch()

    await createNewWallet(window)

    // It's already selected (first item in Settings menu)
    await window.getByTestId('sidebar-settings').click()
  })

  test.afterEach(async () => {
    await window.close()
  })

  test('Should display the Network Configuration page title', async () => {
    await expect(window.getByTestId('settings-layout-title')).toBeVisible()
  })

  test('Should display the network profile select', async () => {
    await expect(window.getByTestId('network-profile-select')).toBeVisible()
  })

  test('Should display the network profile actions button', async () => {
    await expect(window.getByTestId('network-profile-actions-button')).toBeVisible()
  })

  test('Should display blockchain accordion items', async () => {
    await expect(window.getByTestId('blockchain-network-accordion-neo3')).toBeVisible()
    await expect(window.getByTestId('blockchain-network-accordion-ethereum')).toBeVisible()
  })

  test('Should have the Neo 3 accordion open by default', async () => {
    await expect(window.getByTestId('blockchain-network-current-neo3')).toBeVisible()
    await expect(window.getByTestId('blockchain-network-url-neo3')).toBeVisible()
  })

  test('Should expand and collapse a blockchain accordion', async () => {
    await expect(window.getByTestId('blockchain-network-current-ethereum')).not.toBeVisible()

    await window.getByTestId('blockchain-network-accordion-ethereum').click()
    await expect(window.getByTestId('blockchain-network-current-ethereum')).toBeVisible()

    await window.getByTestId('blockchain-network-accordion-ethereum').click()
    await expect(window.getByTestId('blockchain-network-current-ethereum')).not.toBeVisible()
  })

  test('Should disable the Current Network button for the default profile', async () => {
    await expect(window.getByTestId('blockchain-network-current-neo3')).toBeDisabled()
  })

  test('Should not show Edit profile and Reset profile options for the default profile', async () => {
    await window.getByTestId('network-profile-actions-button').click()

    await expect(window.getByTestId('network-profile-actions-create')).toBeVisible()
    await expect(window.getByTestId('network-profile-actions-edit')).not.toBeVisible()
    await expect(window.getByTestId('network-profile-actions-reset')).not.toBeVisible()
  })

  test('Should create a new network profile', async () => {
    await createAndSelectProfile(window, 'Test Profile')

    await expect(window.getByTestId('network-profile-select')).toContainText('Test Profile')
  })

  test('Should keep the Save button disabled while the profile name is empty', async () => {
    await window.getByTestId('network-profile-actions-button').click()
    await window.getByTestId('network-profile-actions-create').click()

    await expect(window.getByTestId('add-network-profile-save')).toBeDisabled()
  })

  test('Should edit a custom network profile name', async () => {
    await createAndSelectProfile(window, 'Test Profile')

    const updatedName = 'Updated Profile'

    await window.getByTestId('network-profile-actions-button').click()
    await window.getByTestId('network-profile-actions-edit').click()

    await window.getByTestId('add-network-profile-name').clear()
    await window.getByTestId('add-network-profile-name').fill(updatedName)
    await window.getByTestId('add-network-profile-save').click()

    await expect(window.getByTestId('network-profile-select')).toContainText(updatedName)
  })

  test('Should delete a custom network profile', async () => {
    await createAndSelectProfile(window, 'Test Profile')

    await window.getByTestId('network-profile-actions-button').click()
    await window.getByTestId('network-profile-actions-edit').click()
    await window.getByTestId('add-network-profile-delete').click()

    await expect(window.getByTestId('network-profile-select')).not.toContainText('Test Profile')
  })

  test('Should reset a custom network profile to default networks', async () => {
    await createAndSelectProfile(window, 'Test Profile')

    await window.getByTestId('blockchain-network-current-neo3').click()
    await window.getByText(testnetName).click()
    await window.getByTestId('network-selection-save').click()

    await expect(window.getByTestId('blockchain-network-current-neo3')).toContainText(testnetName)

    await window.getByTestId('network-profile-actions-button').click()
    await window.getByTestId('network-profile-actions-reset').click()

    await expect(window.getByTestId('blockchain-network-current-neo3')).not.toContainText(testnetName)
  })

  test('Should open the network selection modal for a non-default profile', async () => {
    await createAndSelectProfile(window, 'My Profile')

    await window.getByTestId('blockchain-network-current-neo3').click()

    await expect(window.getByTestId('network-selection-select-network')).toBeVisible()
    await expect(window.getByTestId('network-selection-item').first()).toBeVisible()
  })

  test('Should save a selected network', async () => {
    await createAndSelectProfile(window, 'My Profile')

    await window.getByTestId('blockchain-network-current-neo3').click()

    await window.getByTestId('network-selection-item').filter({ hasText: testnetName }).click()
    await window.getByTestId('network-selection-save').click()

    await expect(window.getByTestId('blockchain-network-current-neo3')).toContainText(testnetName)
  })

  test('Should open the network URL selection modal', async () => {
    await window.getByTestId('blockchain-network-url-neo3').click()

    await expect(window.getByTestId('network-url-selection-description')).toBeVisible()
  })

  test('Should display the select automatically checkbox', async () => {
    await window.getByTestId('blockchain-network-url-neo3').click()

    await expect(window.getByTestId('network-url-selection-auto')).toBeVisible()
  })

  test('Should save after toggling automatic URL selection', async () => {
    await window.getByTestId('blockchain-network-url-neo3').click()

    await window.getByTestId('network-url-selection-auto').click()
    await window.getByTestId('network-url-selection-save').click()

    await expect(window.getByTestId('blockchain-network-url-neo3')).toBeVisible()
  })
})
