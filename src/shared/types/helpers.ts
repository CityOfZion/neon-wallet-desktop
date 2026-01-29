import type { TBSToken } from '@cityofzion/blockchain-service'
import type { JSX, ReactNode } from 'react'
import type { ToastT } from 'sonner'

import { TBlockchainServiceKey } from './blockchain'
import type { TUseTransactionsTransaction } from './hooks'
import type { IAccountState, TCurrency, TLanguage } from './store'
export type TAccountHelperPredicateParams = {
  address: string
  blockchain: TBlockchainServiceKey
}

export type TBuyAndSellTokensHelperGetSellUrlParams = {
  account?: IAccountState
  currency: TCurrency
}

export type TBuyAndSellTokensHelperInitBuyParams = {
  account?: IAccountState
  currency: TCurrency
  id: string
}

export type TCurrencyHelperFormatOptions = {
  currency: TCurrency
  minimumFractionDigits?: number
  maximumFractionDigits?: number
  showZero?: boolean
  approximateSymbol?: boolean
}

export type TSkinHelperColorSkin = {
  id: string
  color: string
}

export type TSkinHelperLocalSkin = {
  blockchain: TBlockchainServiceKey
  collectionHash: string
  component: JSX.Element
}

export type TStringHelperRemoveSpecialCharacterOptions = {
  allowSpaces?: boolean
  allowDots?: boolean
  trimText?: boolean
}

export type TAccountHelperGetServiceAccountParams = {
  account: IAccountState
  key: string
}

export type TDateHelperFormatLocalizedOptions = {
  format: string
  language: TLanguage
}

export type TToastHelperToastOptions = Omit<ToastT, 'id'> & {
  message: ReactNode
  id?: string | number
}

export type TToastHelperToastProps = {
  message: ReactNode
  className?: string
  sonnerId: string | number
  icon?: JSX.Element
  closeable?: boolean
}

export type TClickupHelperCreateSupportTicketParams = {
  name: string
  email: string
  description: string
}

export type TExportTransactionsHelperCalculateDateSelectionMaxOneYearParams = {
  dateFrom: Date
  dateTo: Date
}

export type TExportTransactionsHelperCalculateDateToSelectionMaxOneYearResponse = {
  dateTo: Date
  dateFrom?: Date
}

export type TExportTransactionsHelperCalculateDateFromSelectionMaxOneYearResponse = {
  dateFrom: Date
  dateTo?: Date
}

export type TTransactionHelperBuildPendingTransactionParams = {
  txId: string
  fromAccount: IAccountState
  type?: Exclude<TUseTransactionsTransaction['type'], 'bridgeNeo3NeoX'>
  events?: { toAccount?: IAccountState; toAddress: string; token: TBSToken; amount: string }[]
}
