import { hasEncryption, hasNameService } from '@cityofzion/blockchain-service'
import { useTranslation } from 'react-i18next'

import { UtilsHelper } from '@renderer/helpers/UtilsHelper'

import { bsAggregator } from '@renderer/libs/blockchain-service'
import { getI18next } from '@shared/libs/i18next'
import { neonMigrateSchema } from '@shared/schemas/neon-migrate'
import { TAccountsToImport, TWalletToCreate } from '@shared/types/blockchain'
import type {
  TUseNeonMigrateAccountsSchema,
  TUseNeonMigrateContactsSchema,
  TUseNeonMigrateData,
  TUseNeonMigrateDecryptedAccountSchema,
  TUseNeonMigrateGeneratedData,
  TUseNeonMigrateParsedContent,
} from '@shared/types/hooks'
import { IContactState, TContactAddress } from '@shared/types/store'

import { useBlockchainActions } from './useBlockchainActions'
import { useContactsSelector } from './useContactSelector'

const neonMigrateSchemaWithTransform = neonMigrateSchema.transform(data => {
  const transformedAccounts: TUseNeonMigrateAccountsSchema[] = []

  data.accounts.forEach(({ label, address, key }) => {
    if (!address || !key || transformedAccounts.some(account => account.address === address || account.key === key))
      return

    const [blockchain] = bsAggregator.getBlockchainNameByAddress(address)

    if (!blockchain) return

    const { t } = getI18next()

    transformedAccounts.push({
      address,
      key,
      label: label || t('hooks:useBackupOrMigrate.defaultAccountLabel'),
      blockchain,
    })
  })

  const transformedContacts = data.contacts.map<TUseNeonMigrateContactsSchema>(contact => {
    const transformedAddresses: TUseNeonMigrateContactsSchema['addresses'] = []
    const blockchainServices = Object.values(bsAggregator.blockchainServicesByName)

    contact.addresses?.forEach(address => {
      for (const service of blockchainServices) {
        if (
          (hasNameService(service) && service.validateNameServiceDomainFormat(address)) ||
          service.validateAddress(address)
        ) {
          transformedAddresses.push({ address, blockchain: service.name })
          return
        }
      }
    })

    const { t } = getI18next()

    return { name: contact.name ?? t('hooks:useBackupOrMigrate.defaultContactName'), addresses: transformedAddresses }
  })

  return {
    accounts: transformedAccounts,
    contacts: transformedContacts,
  }
})

export const useNeonImportMigrate = () => {
  const { t: commonT } = useTranslation('common', { keyPrefix: 'wallet' })
  const { contactsRef } = useContactsSelector()
  const { createContacts, createWallet, importAccounts } = useBlockchainActions()

  const validateAndParseFile = async (fileContent: string): Promise<TUseNeonMigrateData | undefined> => {
    try {
      const parsedContent = JSON.parse(fileContent)
      const validatedContent = await neonMigrateSchemaWithTransform.parseAsync(parsedContent)

      return { content: validatedContent, type: 'migrate' }
    } catch {
      /* empty */
    }

    return undefined
  }

  const handleTryDecryptAccount = async (
    accountToMigrate: TUseNeonMigrateAccountsSchema,
    password: string
  ): Promise<TUseNeonMigrateDecryptedAccountSchema | undefined> => {
    const service = bsAggregator.blockchainServicesByName[accountToMigrate.blockchain]

    if (!hasEncryption(service)) return undefined

    const decryptedAccount = await service.decrypt(accountToMigrate.key, password)

    return {
      ...accountToMigrate,
      decryptedKey: decryptedAccount.key,
    }
  }

  const handleGenerateData = (
    content: TUseNeonMigrateParsedContent,
    decryptedAccounts: TUseNeonMigrateDecryptedAccountSchema[]
  ): TUseNeonMigrateGeneratedData => {
    const contactsToCreate: IContactState[] = []
    const walletToCreate: TWalletToCreate = { name: commonT('migratedWalletName'), backupStatus: 'successful' }
    const accountsToCreate: TAccountsToImport = []

    decryptedAccounts.map(({ address, blockchain, decryptedKey, label }) => {
      if (!blockchain) return

      accountsToCreate.push({ address, blockchain, key: decryptedKey, type: 'standard', name: label })
    })

    content.contacts.forEach(({ name, addresses }) => {
      const contactAddresses: TContactAddress[] = []
      const foundContact = contactsRef.current.find(contact => name === contact.name)

      addresses.forEach(({ address, blockchain }) => {
        if (!blockchain || foundContact?.addresses?.some(contact => contact.address === address)) return

        contactAddresses.push({ address, blockchain })
      })

      if (!contactAddresses.length) return

      contactsToCreate.push({ name, id: UtilsHelper.uuid(), addresses: contactAddresses })
    })

    return {
      walletToCreate,
      accountsToCreate,
      contactsToCreate,
    }
  }

  const handleImportBackupData = async (data: TUseNeonMigrateGeneratedData) => {
    createContacts(data.contactsToCreate)

    const wallet = createWallet(data.walletToCreate)
    const accounts = await importAccounts({ wallet, accounts: data.accountsToCreate })

    return { wallet, accounts }
  }

  return {
    validateAndParseFile,
    handleTryDecryptAccount,
    handleGenerateData,
    handleImportBackupData,
  }
}
