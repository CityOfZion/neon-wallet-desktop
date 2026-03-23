import {
  TBalanceResponse,
  TBSToken,
  type TPingNetworkResponse,
  TTokenPricesResponse,
} from '@cityofzion/blockchain-service'
import type { TWalletKitHelperSessionDetails } from '@cityofzion/bs-multichain'
import { QueryKey, UseQueryOptions } from '@tanstack/react-query'
import type { SessionTypes } from '@walletconnect/types'

import { TBlockchainServiceKey } from './blockchain'
import type { Optional } from './global'
import type { IAccountState } from './store'

export type TBaseOptions<T = unknown> = Omit<UseQueryOptions<T, unknown, T, QueryKey>, 'queryKey' | 'queryFn'>

export type TExchange = TTokenPricesResponse & {
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

export type TTokenBalance = TBalanceResponse & {
  blockchain: TBlockchainServiceKey
  amountNumber: number
  exchangeConvertedPrice: number
  exchangeAmount: number
}
export type TBalance = {
  address: string
  blockchain: TBlockchainServiceKey
  tokensBalances: TTokenBalance[]
  tokensBalancesMap: Map<string, TTokenBalance>
  exchangeTotal: number
}

export type TUseBalancesFetchResult = {
  address: string
  blockchain: TBlockchainServiceKey
  tokensBalancesMap: Map<string, TTokenBalance>
}

export type TUseBalancesResult = {
  data: TBalance[]
  groupedTokenBalances: TTokenBalance[]
  isLoading: boolean
  exchangeTotal: number
}

export type TUseBalanceResult = {
  data: TBalance | undefined
  isLoading: boolean
}

export type TUseBalancesParams = {
  address: string
  blockchain: TBlockchainServiceKey
}

export type TUseBalanceOptionShowType = 'hidden' | 'active'

export type TUseBalancesOptions = {
  showType?: TUseBalanceOptionShowType
  queryOptions?: TBaseOptions<TUseBalancesFetchResult>
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
  tokens: TBSToken[]
  blockchain: TBlockchainServiceKey
}

export type TUseUnclaimedResult = {
  unclaimed: string
  unclaimedNumber: number
  fee: string
  feeNumber: number
}

export type TPingNetwork = Optional<TPingNetworkResponse, 'height' | 'latency'>

export type TUseWalletConnectSessionsResult = SessionTypes.Struct & {
  details: TWalletKitHelperSessionDetails
  account: IAccountState
}
