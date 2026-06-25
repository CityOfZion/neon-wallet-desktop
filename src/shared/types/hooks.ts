import { FormEvent, MouseEvent } from 'react'

import type { TBSToken, TTransactionDefault, TTransactionUtxo } from '@cityofzion/blockchain-service'
import type { TBSNeo3Name } from '@cityofzion/bs-neo3'
import type { TBSStellarName } from '@cityofzion/bs-stellar'
import zod from 'zod'

import type { neonBackupContentSchema, neonBackupDataSchema } from '@shared/schemas/neon-backup'
import {
  type TAccountsToImport,
  TBlockchainServiceKey,
  type TCreateWalletAndAccountParam,
  type TNetwork,
  type TUseCreateWalletParams,
} from '@shared/types/blockchain'

import type { TUseBalanceResult } from './query'
import type { TAccount, TContact, TSelectedNetworks, TSwapRecord } from './store'

export type TUseActionsData = Record<string, any>

export type TUseActionsOptions = {
  clearErrorsOnChange?: boolean
}

export type TUseActionsErrors<T> = Record<keyof T, string | undefined>

export type TUseActionsChanged<T> = Record<keyof T, boolean>

export type TUseActionsActionState<T> = {
  hasChanged: boolean
  isValid: boolean
  isActing: boolean
  errors: TUseActionsErrors<T>
  changed: TUseActionsChanged<T>
  hasActed: boolean
}

export type TUseActionsReturn<T> = {
  actionData: T
  actionDataRef: React.MutableRefObject<T>
  setData: (values: Partial<T> | ((prev: T) => Partial<T>)) => void
  setError: (key: keyof T, error: string) => void
  setDataFromEventWrapper: (key: keyof T) => (event: any) => void
  clearErrors: (key?: keyof T | (keyof T)[]) => void
  actionState: TUseActionsActionState<T>
  actionStateRef: React.MutableRefObject<TUseActionsActionState<T>>
  handleAct: (callback: (data: T) => void | Promise<void>) => (event: FormEvent | MouseEvent) => Promise<void>
  reset: () => void
}

export type TUseImportActionInputType = 'key' | 'mnemonic' | 'encrypted' | 'address'

export type TUseHardwareWalletByUsbStatus = 'searching' | 'connected' | 'not-connected'

//* useTransactions types *//

export type TUseTransactionsProps = {
  accounts: TAccount[]
  dateFrom: Date
  dateTo: Date
  shouldUseFullTransactionsService: boolean
}

export type TUseTransactionsTransaction = TBlockchainServiceKey extends infer N
  ? N extends TBlockchainServiceKey
    ? TTransactionDefault<N> | TTransactionUtxo<N>
    : never
  : never

export type TUseTransactionsGroupedTransactionsByDate = {
  date: string
  transactions: TUseTransactionsTransaction[]
}

export type TUseTransactionsBuildTransactionsQueryKeyParams = {
  address: string
  blockchain: TBlockchainServiceKey
  network: TNetwork
  dateFrom?: Date
  dateTo?: Date
  page?: number
}

export type TUseTransactionsBuildTransactionsAggregatedQueryKeyParams = {
  dateFrom?: Date
  dateTo?: Date
  accounts?: TAccount[]
  networksByBlockchain?: TSelectedNetworks
}

//* Backups and migrate types *//

export type TUseImportSharedAccountsSchema = {
  address: string
  label: string
  key: string
  blockchain: TBlockchainServiceKey
}

export type TUseImportSharedContactsSchema = {
  addresses: { address: string; blockchain: TBlockchainServiceKey }[]
  name: string
}

export type TUseImportSharedParsedContent = {
  accounts: TUseImportSharedAccountsSchema[]
  contacts?: TUseImportSharedContactsSchema[]
}

export type TUseNeonMigrateData = {
  content: TUseImportSharedParsedContent
  type: 'migrate'
}

export type TUseNep6BackupData = {
  content: TUseImportSharedParsedContent
  type: 'nep6'
}

export type TUseImportSharedDecryptedAccountSchema = TUseImportSharedAccountsSchema & {
  decryptedKey: string
}

export type TUseImportSharedGeneratedData = {
  walletToCreate: TUseCreateWalletParams
  accountsToCreate: TAccountsToImport
  contactsToCreate: TContact[]
}

export type TUseNeonBackupAccount = zod.infer<typeof neonBackupDataSchema>['wallets'][0]['accounts'][0]
export type TUseNeonBackupWallet = zod.infer<typeof neonBackupDataSchema>['wallets'][0]

export type TUseNeonBackupContentSchema = zod.infer<typeof neonBackupContentSchema>
export type TUseNeonBackupDataSchema = zod.infer<typeof neonBackupDataSchema>
export type TUseNeonBackupData = { content: TUseNeonBackupContentSchema; type: 'backup' }
export type TUseNeonBackupDeprecatedData = { content: string; type: 'backup-deprecated' }

export type TUseNeonBackupGeneratedData = {
  wallets: TCreateWalletAndAccountParam[]
  swapRecords?: TSwapRecord[]
  contacts?: TContact[]
}

export type TUseNeo3VoteCalculateVoteFeeParams = {
  neo3Account?: TAccount<TBSNeo3Name>
  candidatePubKey: string
}

export type TUseNeo3VoteValidationsParams = {
  balanceQuery: TUseBalanceResult
  gasFee?: string
}

export type TUseNeo3VoteBuildGetCandidatesToVoteQueryKeyParams = {
  neo3Network: TNetwork
}

export type TUseNeo3VoteBuildGetVoteDetailsByAddressQueryKeyParams = {
  neo3Network: TNetwork
  address?: string
}

export type TUseNeo3VoteBuildCalculateVoteFeeQueryKeyParams = {
  neo3Network: TNetwork
  candidatePubKey: string
  neo3Account?: TAccount<TBSNeo3Name>
}

export type TUseStellarPersistTrustlineMutationParams = {
  stellarAccount: TAccount<TBSStellarName>
  token: TBSToken
  limit?: string
}
