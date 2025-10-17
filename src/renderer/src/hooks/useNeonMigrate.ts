import { hasEncryption, hasNameService } from '@cityofzion/blockchain-service'
import { useTranslation } from 'react-i18next'
import zod from 'zod'

import { UtilsHelper } from '@renderer/helpers/UtilsHelper'

import { bsAggregator } from '@renderer/libs/blockchain-service'
import { TAccountsToImport, TBlockchainServiceKey, TWalletToCreate } from '@shared/@types/blockchain'
import { IContactState, TContactAddress } from '@shared/@types/store'
import { getI18next } from '@shared/libs/i18next'

import { useBlockchainActions } from './useBlockchainActions'
import { useContactsSelector } from './useContactSelector'

const { t } = getI18next()

export type TUseNeonMigrateAccountsSchema = {
  address: string
  label: string
  key: string
  blockchain: TBlockchainServiceKey
}

export type TUseNeonMigrateContactsSchema = {
  addresses: { address: string; blockchain: TBlockchainServiceKey }[]
  name: string
}

export type TUseNeonMigrateSchema = zod.infer<typeof migrateSchema>
export type TUseNeonMigrateData = { content: TUseNeonMigrateSchema; type: 'migrate' }

export type TUseNeonMigrateDecryptedAccountSchema = TUseNeonMigrateAccountsSchema & {
  decryptedKey: string
}

export type TUseNeonMigrateGeneratedData = {
  walletToCreate: TWalletToCreate
  accountsToCreate: TAccountsToImport
  contactsToCreate: IContactState[]
}

const migrateAccountsSchema = zod.object({
  address: zod.string().nullish(),
  label: zod.string().nullish(),
  key: zod.string().nullish(),
})

const migrateContactsSchema = zod.object({ name: zod.string().nullish(), addresses: zod.array(zod.string()).nullish() })

const migrateSchema = zod
  .object({
    accounts: zod.array(migrateAccountsSchema),
    contacts: zod.array(migrateContactsSchema),
  })
  .transform(data => {
    const transformedAccounts: TUseNeonMigrateAccountsSchema[] = []

    data.accounts.forEach(({ label, address, key }) => {
      if (!address || !key || transformedAccounts.some(account => account.address === address || account.key === key))
        return

      const [blockchain] = bsAggregator.getBlockchainNameByAddress(address)

      if (!blockchain) return

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
      const validatedContent = await migrateSchema.parseAsync(parsedContent)

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
    content: TUseNeonMigrateSchema,
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
