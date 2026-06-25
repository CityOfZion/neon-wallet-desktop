import { hasEncryption } from '@cityofzion/blockchain-service'

import { BlockchainServiceHelper } from '@renderer/helpers/BlockchainServiceHelper'

import type {
  TUseImportSharedAccountsSchema,
  TUseImportSharedDecryptedAccountSchema,
  TUseImportSharedGeneratedData,
} from '@shared/types/hooks'

import { useImportAccounts } from './useAccountActions'
import { useCreateContacts } from './useContactActions'
import { useCreateWallet } from './useWalletActions'

export const useImportShared = () => {
  const { importAccounts } = useImportAccounts()
  const { createContacts } = useCreateContacts()
  const { createWallet } = useCreateWallet()

  const handleTryDecryptAccount = async (
    account: TUseImportSharedAccountsSchema,
    password: string
  ): Promise<TUseImportSharedDecryptedAccountSchema | undefined> => {
    const service = BlockchainServiceHelper.bsAggregator.blockchainServicesByName[account.blockchain]

    if (!hasEncryption(service)) return undefined

    const decryptedAccount = await service.decrypt(account.key, password)

    return {
      ...account,
      decryptedKey: decryptedAccount.key,
    }
  }

  const handleImportBackupData = async (data: TUseImportSharedGeneratedData) => {
    createContacts(data.contactsToCreate)

    const wallet = createWallet(data.walletToCreate)
    const accounts = await importAccounts({ wallet, accounts: data.accountsToCreate })

    return { wallet, accounts }
  }

  return {
    handleTryDecryptAccount,
    handleImportBackupData,
  }
}
