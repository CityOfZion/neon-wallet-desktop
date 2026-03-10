import { FormEvent, MouseEvent } from 'react'

import {
  type TGetTransactionsByAddressResponse,
  type TTransactionBase,
  type TTransactionBridgeNeo3NeoX,
  type TTransactionNftEvent,
  type TTransactionTokenEvent,
} from '@cityofzion/blockchain-service'
import zod from 'zod'

import type { neonBackupContentSchema, neonBackupDataSchema } from '@shared/schemas/neon-backup'
import {
  type TAccountsToImport,
  TBlockchainServiceKey,
  type TCreateWalletAndAccountParam,
  type TNetwork,
  type TUseCreateWalletParams,
} from '@shared/types/blockchain'

import type { IAccountState, IContactState, TSelectedNetworks, TSwapRecord } from './store'

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
  accounts: IAccountState[]
  dateTo: Date
  dateFrom: Date
  shouldUseFullTransactionsService: boolean
}

export type TUseTransactionsTransactionEvent = (TTransactionTokenEvent | TTransactionNftEvent) & {
  fromAccount?: IAccountState
  toAccount?: IAccountState
}

export type TUseTransactionsTransaction = TTransactionBase & {
  account: IAccountState
  blockchain: TBlockchainServiceKey
  isPending: boolean
  events: TUseTransactionsTransactionEvent[]
} & ({ type: 'default' } | { type: 'claim' } | { type: 'vote' } | TTransactionBridgeNeo3NeoX<TBlockchainServiceKey>)

export type TUseTransactionsQueryData = Omit<
  TGetTransactionsByAddressResponse<TBlockchainServiceKey>,
  'transactions'
> & {
  transactions: Map<string, TUseTransactionsTransaction>
}

export type TUseTransactionsGroupedTransactionsByDate = {
  date: string
  transactions: TUseTransactionsTransaction[]
}

export type TUseTransactionsBuildTransactionsQueryKeyParams = {
  account: IAccountState
  network: TNetwork
  dateFrom?: Date
  dateTo?: Date
  page?: number
}

export type TUseTransactionsBuildTransactionsAggregatedQueryKeyParams = {
  dateFrom?: Date
  dateTo?: Date
  accounts?: IAccountState[]
  networksByBlockchain?: TSelectedNetworks
}

//* useNeonMigrate types *//

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

export type TUseNeonMigrateParsedContent = {
  accounts: TUseNeonMigrateAccountsSchema[]
  contacts: TUseNeonMigrateContactsSchema[]
}

export type TUseNeonMigrateData = { content: TUseNeonMigrateParsedContent; type: 'migrate' }

export type TUseNeonMigrateDecryptedAccountSchema = TUseNeonMigrateAccountsSchema & {
  decryptedKey: string
}

export type TUseNeonMigrateGeneratedData = {
  walletToCreate: TUseCreateWalletParams
  accountsToCreate: TAccountsToImport
  contactsToCreate: IContactState[]
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
  contacts?: IContactState[]
}
