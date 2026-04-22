import type { SeverityLevel } from '@sentry/electron'
import type { JSX, ReactNode } from 'react'
import type { ToastT } from 'sonner'

import { TBlockchainServiceKey } from './blockchain'
import type { TAccount, TCurrency, TLanguage } from './store'

export type TAccountHelperPredicateParams = {
  address: string
  blockchain: TBlockchainServiceKey
}

export type TBuyAndSellTokensHelperGetSellUrlParams = {
  account?: TAccount
  currency: TCurrency
}

export type TBuyAndSellTokensHelperInitBuyParams = {
  account?: TAccount
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

export type TDateHelperCalculateDateSelectionMaxOneYearParams = {
  dateFrom: Date
  dateTo: Date
}

export type TDateHelperCalculateDateFromSelectionMaxOneYearResponse = {
  dateFrom: Date
  dateTo?: Date
}

export type TDateHelperCalculateDateToSelectionMaxOneYearResponse = {
  dateTo: Date
  dateFrom?: Date
}

export type TLoggerHelperOptions = {
  where: string
  operation?: string
}

export type TSentryHelperOptions = TLoggerHelperOptions & {
  level: SeverityLevel
}
