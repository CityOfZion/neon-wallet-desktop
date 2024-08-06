import { BalanceResponse, Token, TokenPricesResponse } from '@cityofzion/blockchain-service'
import { QueryKey, UseQueryOptions } from '@tanstack/react-query'

import { TBlockchainServiceKey } from './blockchain'

export type TBaseOptions<T = unknown> = Omit<UseQueryOptions<T, unknown, T, QueryKey>, 'queryKey' | 'queryFn'>

export type TExchange = TokenPricesResponse & {
  convertedPrice: number
}
export type TMultiExchange = Record<TBlockchainServiceKey, Map<string, TExchange>>
export type TUseExchangeResult = {
  data: TMultiExchange | undefined
  isLoading: boolean
}

export type TUseCurrencyRatioResult = {
  data: number | undefined
  isLoading: boolean
}

export type TTokenBalance = BalanceResponse & {
  blockchain: TBlockchainServiceKey
  amountNumber: number
  exchangeConvertedPrice: number
  exchangeAmount: number
}
export type TBalance = {
  address: string
  tokensBalances: TTokenBalance[]
  exchangeTotal: number
}

export type TUseBalancesResult = {
  data: TBalance[]
  isLoading: boolean
  exchangeTotal: number
}

export type TUseBalancesParams = {
  address: string
  blockchain: TBlockchainServiceKey
}

export type TPriceHistory = {
  tokenBalance: TTokenBalance
  todayPrice: number
  dailyVariation: number
  sortedPrices: number[]
  sortedPricesByTimestamp: number[]
}

export type TUsePriceHistoryResult = {
  data: TPriceHistory[]
  isLoading: boolean
}

export type TUseExchangeParams = {
  tokens: Token[]
  blockchain: TBlockchainServiceKey
}
