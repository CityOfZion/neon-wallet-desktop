import { useMemo } from 'react'
import { ExchangeHelper } from '@renderer/helpers/ExchangeHelper'
import { NumberHelper } from '@renderer/helpers/NumberHelper'
import { useCurrencyRatio } from '@renderer/hooks/useCurrencyRatio'
import { bsAggregator } from '@renderer/libs/blockchainService'
import { TBlockchainServiceKey, TNetwork } from '@shared/@types/blockchain'
import {
  TBalance,
  TTokenBalance,
  TUseBalanceOptionShowType,
  TUseBalanceResult,
  TUseBalancesOptions,
  TUseBalancesParams,
  TUseBalancesResult,
} from '@shared/@types/query'
import { TCurrency, THiddenTokenByBlockchain } from '@shared/@types/store'
import { QueryClient, useQueries, useQuery, useQueryClient } from '@tanstack/react-query'

import { fetchExchange } from './useExchange'
import { useCurrencySelector, useSelectedNetworkByBlockchainSelector } from './useSettingsSelector'
import { useHiddenTokensByBlockchainSelector } from './useUtilitySelector'

export function buildQueryKeyBalance(
  address: string,
  blockchain: TBlockchainServiceKey,
  network: TNetwork<TBlockchainServiceKey>,
  currency?: TCurrency
) {
  const key: any[] = ['balance', address, blockchain, network.id]

  if (currency) {
    key.push(currency)
  }

  return key
}

const fetchBalance = async (
  param: TUseBalancesParams,
  network: TNetwork<TBlockchainServiceKey>,
  queryClient: QueryClient,
  currency: TCurrency,
  currencyRatio: number
): Promise<Omit<TBalance, 'exchangeTotal'>> => {
  try {
    const service = bsAggregator.blockchainServicesByName[param.blockchain]
    const balance = await service.blockchainDataService.getBalance(param.address)
    const tokens = balance.map(balance => balance.token)
    const exchange = await fetchExchange(param.blockchain, tokens, network, queryClient, currency, currencyRatio)

    const tokensBalances: TTokenBalance[] = []

    await Promise.allSettled(
      balance.map(async balance => {
        const exchangeConvertedPrice = ExchangeHelper.getExchangeConvertedPrice(
          balance.token.hash,
          param.blockchain,
          exchange
        )

        const amountNumber = NumberHelper.number(balance.amount)
        const exchangeAmount = amountNumber * exchangeConvertedPrice

        tokensBalances.push({
          ...balance,
          blockchain: param.blockchain,
          amount: balance.amount,
          amountNumber,
          exchangeAmount,
          exchangeConvertedPrice,
        })
      })
    )

    return {
      address: param.address,
      tokensBalances,
    }
  } catch {
    return {
      address: param.address,
      tokensBalances: [],
    }
  }
}

const filterHiddenTokens = (
  tokensBalance: TTokenBalance[],
  showType: TUseBalanceOptionShowType,
  hiddenTokensByBlockchain: THiddenTokenByBlockchain
) => {
  return tokensBalance.filter(tokenBalance => {
    const hiddenTokens = hiddenTokensByBlockchain[tokenBalance.blockchain]
    const isHiddenToken = hiddenTokens?.includes(tokenBalance.token.hash)

    if (showType === 'active' && isHiddenToken) return false
    if (showType === 'hidden' && !isHiddenToken) return false

    return true
  })
}

export function useBalances(params: TUseBalancesParams[], options?: TUseBalancesOptions): TUseBalancesResult {
  const { showType = 'active' } = options ?? {}

  const { networkByBlockchain } = useSelectedNetworkByBlockchainSelector()
  const queryClient = useQueryClient()
  const { isLoading: isCurrencyRatioLoading, data: currencyRatio } = useCurrencyRatio()
  const { currency } = useCurrencySelector()
  const { hiddenTokensByBlockchain } = useHiddenTokensByBlockchainSelector()

  return useQueries({
    queries: params.map(param => ({
      queryKey: buildQueryKeyBalance(param.address, param.blockchain, networkByBlockchain[param.blockchain], currency),
      queryFn: fetchBalance.bind(
        null,
        param,
        networkByBlockchain[param.blockchain],
        queryClient,
        currency,
        currencyRatio ?? 0
      ),
      enabled: !isCurrencyRatioLoading && typeof currencyRatio === 'number',
    })),
    combine: results => {
      const isLoading = isCurrencyRatioLoading || results.some(result => result.isLoading)

      const data: TBalance[] = []
      let exchangeTotal = 0

      if (!isLoading) {
        results.forEach(result => {
          if (!result.data) return

          const tokensBalances = filterHiddenTokens(result.data.tokensBalances, showType, hiddenTokensByBlockchain)

          data.push({
            ...result.data,
            tokensBalances,
            exchangeTotal: tokensBalances.reduce((acc, tokenBalance) => acc + tokenBalance.exchangeAmount, 0),
          })
        })

        exchangeTotal = data.reduce((acc, result) => acc + (result.exchangeTotal ?? 0), 0)
      }

      return {
        data,
        isLoading,
        exchangeTotal,
      }
    },
  })
}

export function useBalance(
  balanceParams: TUseBalancesParams | undefined,
  options?: TUseBalancesOptions
): TUseBalanceResult {
  const { networkByBlockchain } = useSelectedNetworkByBlockchainSelector()
  const queryClient = useQueryClient()
  const { currency } = useCurrencySelector()
  const { isLoading: isCurrencyRatioLoading, data: currencyRatio } = useCurrencyRatio()
  const { hiddenTokensByBlockchain } = useHiddenTokensByBlockchainSelector()

  const params = balanceParams ?? { address: '', blockchain: 'neo3' }
  const { showType = 'active' } = options ?? {}

  const query = useQuery({
    queryKey: buildQueryKeyBalance(params.address, params.blockchain, networkByBlockchain[params.blockchain], currency),
    queryFn: fetchBalance.bind(
      null,
      params,
      networkByBlockchain[params.blockchain],
      queryClient,
      currency,
      currencyRatio ?? 0
    ),
    enabled: !!balanceParams && !isCurrencyRatioLoading && typeof currencyRatio === 'number',
  })

  const data = useMemo(() => {
    if (!query.data) return undefined

    const tokensBalances = filterHiddenTokens(query.data.tokensBalances, showType, hiddenTokensByBlockchain)
    return {
      ...query.data,
      exchangeTotal: tokensBalances.reduce((acc, tokenBalance) => acc + tokenBalance.exchangeAmount, 0),
    }
  }, [showType, hiddenTokensByBlockchain, query.data])

  return {
    ...query,
    data,
  }
}
