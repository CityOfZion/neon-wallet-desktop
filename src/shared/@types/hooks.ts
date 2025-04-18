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

export type TUseImportActionInputType = 'key' | 'mnemonic' | 'encrypted' | 'address'

export type TUseTransactionsTransfer = {
  time: number
  hash: string
  account: IAccountState
  toAccount?: IAccountState
  fromAccount?: IAccountState
  isPending?: boolean
  isClaim?: boolean
  isMigrate?: boolean
  amount: string
  to: string
  from: string
  asset: string
  assetHash: string
  explorerUrl?: string
}
export type TFetchTransactionsResponse = {
  transfers: TUseTransactionsTransfer[]
  nextPageParams?: any
}

export type TUseHardwareWalletByUsbStatus = 'searching' | 'connected' | 'not-connected'
