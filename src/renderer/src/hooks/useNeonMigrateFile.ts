import { hasNameService } from '@cityofzion/blockchain-service'
import { useTranslation } from 'react-i18next'

import { BlockchainServiceHelper } from '@renderer/helpers/BlockchainServiceHelper'
import { Nep6Helper } from '@renderer/helpers/Nep6Helper'
import { UtilsHelper } from '@renderer/helpers/UtilsHelper'

import { SharedI18nextHelper } from '@shared/helpers/SharedI18nextHelper'
import { neonMigrateSchema } from '@shared/schemas/neon-migrate'
import { TAccountsToImport, TUseCreateWalletParams } from '@shared/types/blockchain'
import type {
  TUseImportNep6Account,
  TUseImportNep6DecryptedAccount,
  TUseNeonMigrateContacts,
  TUseNeonMigrateData,
  TUseNeonMigrateGeneratedData,
  TUseNeonMigrateParsedContent,
} from '@shared/types/hooks'
import { TContact, TContactAddress } from '@shared/types/store'

import { useImportAccounts } from './useAccountActions'
import { useCreateContacts } from './useContactActions'
import { useContactsSelector } from './useContactSelector'
import { useCreateWallet } from './useWalletActions'

const { t } = SharedI18nextHelper.get()

const neonMigrateSchemaWithTransform = neonMigrateSchema.transform(data => {
  const transformedAccounts = Nep6Helper.transformAccounts(data.accounts)

  const transformedContacts = data.contacts.map<TUseNeonMigrateContacts>(contact => {
    const transformedAddresses: TUseNeonMigrateContacts['addresses'] = []
    const blockchainServices = Object.values(BlockchainServiceHelper.bsAggregator.blockchainServicesByName)

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

    return { name: contact.name || t('hooks:useImportFromFile.migratedContactName'), addresses: transformedAddresses }
  })

  return {
    accounts: transformedAccounts,
    contacts: transformedContacts,
  }
})

export const useNeonMigrateFile = () => {
  const { t: tCommonWallet } = useTranslation('common', { keyPrefix: 'wallet' })
  const { contactsRef } = useContactsSelector()
  const { importAccounts } = useImportAccounts()
  const { createContacts } = useCreateContacts()
  const { createWallet } = useCreateWallet()

  const validateAndParseMigrateFile = async (fileContent: string): Promise<TUseNeonMigrateData | undefined> => {
    try {
      const parsedContent = JSON.parse(fileContent)
      const validatedContent = await neonMigrateSchemaWithTransform.parseAsync(parsedContent)

      return { content: validatedContent, type: 'migrate' }
    } catch {
      /* empty */
    }

    return undefined
  }

  const handleTryDecryptAccount = (account: TUseImportNep6Account, password: string) =>
    Nep6Helper.decryptAccount(account, password)

  const handleGenerateData = (
    content: TUseNeonMigrateParsedContent,
    decryptedAccounts: TUseImportNep6DecryptedAccount[]
  ): TUseNeonMigrateGeneratedData => {
    const contactsToCreate: TContact[] = []
    const walletToCreate: TUseCreateWalletParams = {
      name: tCommonWallet('migratedWalletName'),
      backupStatus: 'successful',
    }
    const accountsToCreate: TAccountsToImport = []

    decryptedAccounts.forEach(({ address, blockchain, decryptedKey, label }) => {
      if (!blockchain) return

      accountsToCreate.push({ address, blockchain, key: decryptedKey, type: 'standard', name: label })
    })

    content.contacts?.forEach(({ name, addresses }) => {
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
    validateAndParseMigrateFile,
    handleTryDecryptAccount,
    handleGenerateData,
    handleImportBackupData,
  }
}
