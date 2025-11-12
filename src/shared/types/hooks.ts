import { FormEvent, MouseEvent } from 'react'

import {
  TBSToken,
  TFullTransactionAssetEvent as TBSFullTransactionAssetEvent,
  TFullTransactionNftEvent as TBSFullTransactionNftEvent,
  TFullTransactionsByAddressResponse as TBSFullTransactionsByAddressResponse,
  TFullTransactionsItem as TBSFullTransactionsItem,
} from '@cityofzion/blockchain-service'
import zod from 'zod'

import type { neonBackupContentSchema, neonBackupDataSchema } from '@shared/schemas/neon-backup'
import {
  type TAccountsToImport,
  TBlockchainServiceKey,
  type TCreateWalletAndAccountParam,
  type TWalletToCreate,
} from '@shared/types/blockchain'

import type { IAccountState, IContactState, TSwapRecord } from './store'

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

export type TUseTransactionsTransfer = {
  time: number
  hash: string
  account: IAccountState
  toAccount?: IAccountState
  fromAccount?: IAccountState
  methodName?: string
  isPending?: boolean
  isClaim?: boolean
  isMigrate?: boolean
  amount: string
  to?: string
  from?: string
  asset: string
  assetHash: string
  token?: TBSToken
  explorerUrl?: string
}

export type TUseHardwareWalletByUsbStatus = 'searching' | 'connected' | 'not-connected'

type TFullTransactionCommonEvent = {
  fromAccount?: IAccountState
  toAccount?: IAccountState
}

export type TFullTransactionNftEvent = TFullTransactionCommonEvent & TBSFullTransactionNftEvent

export type TFullTransactionAssetEvent = TFullTransactionCommonEvent & TBSFullTransactionAssetEvent

export type TFullTransactionEvent = TFullTransactionAssetEvent | TFullTransactionNftEvent

export type TFullTransactionsItem = Omit<TBSFullTransactionsItem, 'events'> & {
  account: IAccountState
  blockchain: TBlockchainServiceKey
  isPending: boolean
  events: TFullTransactionEvent[]
}

export type TFullTransactionsByAddressResponse = Omit<TBSFullTransactionsByAddressResponse, 'data'> & {
  data: Map<string, TFullTransactionsItem>
}

export type TFullTransactionsGroupedDataByDate = {
  date: string
  items: TFullTransactionsItem[]
}

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
  walletToCreate: TWalletToCreate
  accountsToCreate: TAccountsToImport
  contactsToCreate: IContactState[]
}

export type TUseNeonBackupContentSchema = zod.infer<typeof neonBackupContentSchema>
export type TUseNeonBackupDataSchema = zod.infer<typeof neonBackupDataSchema>
export type TUseNeonBackupData = { content: TUseNeonBackupContentSchema; type: 'backup' }
export type TUseNeonBackupDeprecatedData = { content: string; type: 'backup-deprecated' }

export type TUseNeonBackupGeneratedData = {
  wallets: TCreateWalletAndAccountParam[]
  swapRecords?: TSwapRecord[]
  contacts?: IContactState[]
}
