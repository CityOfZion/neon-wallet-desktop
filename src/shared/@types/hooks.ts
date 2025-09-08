import { FormEvent, MouseEvent } from 'react'
import {
  FullTransactionAssetEvent,
  FullTransactionNftEvent,
  FullTransactionsByAddressResponse,
  FullTransactionsItem,
  Token,
} from '@cityofzion/blockchain-service'
import { TBlockchainServiceKey } from '@shared/@types/blockchain'

import { IAccountState } from './store'

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
  token?: Token
  explorerUrl?: string
}

export type TUseHardwareWalletByUsbStatus = 'searching' | 'connected' | 'not-connected'

type TFullTransactionCommonEvent = {
  fromAccount?: IAccountState
  toAccount?: IAccountState
}

export type TFullTransactionNftEvent = TFullTransactionCommonEvent & FullTransactionNftEvent

export type TFullTransactionAssetEvent = TFullTransactionCommonEvent & FullTransactionAssetEvent

export type TFullTransactionEvent = TFullTransactionAssetEvent | TFullTransactionNftEvent

export type TFullTransactionsItem = Omit<FullTransactionsItem, 'events'> & {
  account: IAccountState
  blockchain: TBlockchainServiceKey
  isPending: boolean
  events: TFullTransactionEvent[]
}

export type TFullTransactionsByAddressResponse = Omit<FullTransactionsByAddressResponse, 'data'> & {
  data: Map<string, TFullTransactionsItem>
}

export type TFullTransactionsGroupedDataByDate = {
  date: string
  items: TFullTransactionsItem[]
}
