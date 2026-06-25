import { useTranslation } from 'react-i18next'

import { AccountHelper } from '@renderer/helpers/AccountHelper'

import { nep6BackupSchema } from '@shared/schemas/nep6-backup'
import { TAccountsToImport, TUseCreateWalletParams } from '@shared/types/blockchain'
import type {
  TUseImportSharedDecryptedAccountSchema,
  TUseImportSharedGeneratedData,
  TUseNep6BackupData,
} from '@shared/types/hooks'
import { TContact } from '@shared/types/store'

const nep6BackupSchemaWithTransform = nep6BackupSchema.transform(data => ({
  accounts: AccountHelper.transformAccounts(data.accounts),
}))

export const useNep6BackupFile = () => {
  const { t: tCommonWallet } = useTranslation('common', { keyPrefix: 'wallet' })

  const validateAndParseBackupFile = async (fileContent: string): Promise<TUseNep6BackupData | undefined> => {
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

  const handleGenerateData = (
    decryptedAccounts: TUseImportSharedDecryptedAccountSchema[]
  ): TUseImportSharedGeneratedData => {
    const contactsToCreate: TContact[] = []
    const walletToCreate: TUseCreateWalletParams = { name: tCommonWallet('importedName'), backupStatus: 'successful' }
    const accountsToCreate: TAccountsToImport = []

    decryptedAccounts.forEach(({ address, blockchain, decryptedKey, label }) => {
      if (!blockchain) return

      accountsToCreate.push({ address, blockchain, key: decryptedKey, type: 'standard', name: label })
    })

    return {
      walletToCreate,
      accountsToCreate,
      contactsToCreate,
    }
  }

  return {
    validateAndParseBackupFile,
    handleGenerateData,
  }
}
