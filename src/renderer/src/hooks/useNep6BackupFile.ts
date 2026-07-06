import { useTranslation } from 'react-i18next'

import { Nep6Helper } from '@renderer/helpers/Nep6Helper'

import { nep6BackupSchema } from '@shared/schemas/nep6-backup'
import { TAccountsToImport, TUseCreateWalletParams } from '@shared/types/blockchain'
import type {
  TUseImportNep6Account,
  TUseImportNep6DecryptedAccount,
  TUseNep6Data,
  TUseNep6GeneratedData,
} from '@shared/types/hooks'

import { useImportAccounts } from './useAccountActions'
import { useCreateWallet } from './useWalletActions'

const nep6BackupSchemaWithTransform = nep6BackupSchema.transform(data => ({
  accounts: Nep6Helper.transformAccounts(data.accounts),
}))

export const useNep6BackupFile = () => {
  const { t: tCommonWallet } = useTranslation('common', { keyPrefix: 'wallet' })
  const { importAccounts } = useImportAccounts()
  const { createWallet } = useCreateWallet()

  const validateAndParseBackupFile = async (fileContent: string): Promise<TUseNep6Data | undefined> => {
    try {
      const parsedContent = JSON.parse(fileContent)
      const validatedContent = await nep6BackupSchemaWithTransform.parseAsync(parsedContent)

      if (validatedContent.accounts.length === 0) return undefined

      return { content: validatedContent, type: 'nep6' }
    } catch {
      /* empty */
    }

    return undefined
  }

  const handleTryDecryptAccount = (account: TUseImportNep6Account, password: string) =>
    Nep6Helper.decryptAccount(account, password)

  const handleGenerateData = (decryptedAccounts: TUseImportNep6DecryptedAccount[]): TUseNep6GeneratedData => {
    const walletToCreate: TUseCreateWalletParams = { name: tCommonWallet('importedName'), backupStatus: 'successful' }
    const accountsToCreate: TAccountsToImport = []

    decryptedAccounts.forEach(({ address, blockchain, decryptedKey, label }) => {
      if (!blockchain) return

      accountsToCreate.push({ address, blockchain, key: decryptedKey, type: 'standard', name: label })
    })

    return {
      walletToCreate,
      accountsToCreate,
    }
  }

  const handleImportBackupData = async (data: TUseNep6GeneratedData) => {
    const wallet = createWallet(data.walletToCreate)
    const accounts = await importAccounts({ wallet, accounts: data.accountsToCreate })

    return { wallet, accounts }
  }

  return {
    validateAndParseBackupFile,
    handleTryDecryptAccount,
    handleGenerateData,
    handleImportBackupData,
  }
}
