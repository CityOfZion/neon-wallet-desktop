import { IAccountState } from './store'

export type TUseActionsData = Record<string, any>

export type TUseActionsErrors<T> = Record<keyof T, string | undefined>

export type TUseActionsChanged<T> = Record<keyof T, boolean>

export type TUseActionsActionState<T> = {
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
  amount: string
  to: string
  from: string
  asset: string
}
export type TFetchTransactionsResponse = {
  transfers: TUseTransactionsTransfer[]
  nextPageParams?: any
}
