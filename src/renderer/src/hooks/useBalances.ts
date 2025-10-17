import { useCallback, useMemo } from 'react'

import { BSBigNumberHelper } from '@cityofzion/blockchain-service'
import { QueryClient, useQueries, useQuery, useQueryClient } from '@tanstack/react-query'
import { cloneDeep } from 'lodash'
import { match } from 'ts-pattern'

import { ExchangeHelper } from '@renderer/helpers/ExchangeHelper'
import { NumberHelper } from '@renderer/helpers/NumberHelper'

import { useCurrencyRatio } from '@renderer/hooks/useCurrencyRatio'

import { bsAggregator } from '@renderer/libs/blockchain-service'
import { TBlockchainServiceKey, TNetwork } from '@shared/@types/blockchain'
import {
  TBalance,
  TTokenBalance,
  TUseBalanceOptionShowType,
  TUseBalanceResult,
  TUseBalancesFetchResult,
  TUseBalancesOptions,
  TUseBalancesParams,
  TUseBalancesResult,
} from '@shared/@types/query'
import { TCurrency, THiddenTokenByBlockchain } from '@shared/@types/store'

import { fetchExchange } from './useExchange'
import { useCurrencySelector, useSelectedNetworkByBlockchainSelector } from './useSettingsSelector'
import { useHiddenTokensByBlockchainSelector } from './useUtilitySelector'

export function buildQueryKeyBalance(
  address: string,
  blockchain: TBlockchainServiceKey,
  network: TNetwork,
  currency?: TCurrency
) {
  const key: any[] = ['balance', address, blockchain, network]

  if (currency) {
    key.push(currency)
  }

  return key
}

const fetchBalance = async (
  param: TUseBalancesParams,
  network: TNetwork,
  queryClient: QueryClient,
  currency: TCurrency,
  currencyRatio: number
): Promise<TUseBalancesFetchResult> => {
  try {
    const service = bsAggregator.blockchainServicesByName[param.blockchain]
    const balance = await service.blockchainDataService.getBalance(param.address)
    const tokens = balance.map(balance => balance.token)
    const exchange = await fetchExchange(param.blockchain, tokens, network, queryClient, currency, currencyRatio)
    const tokensBalancesMap: Map<string, TTokenBalance> = new Map()

    await Promise.allSettled(
      balance.map(async balance => {
        const amountNumber = NumberHelper.number(balance.amount)

        if (isNaN(amountNumber) || amountNumber <= 0) return

        const exchangeConvertedPrice = ExchangeHelper.getExchangeConvertedPrice(
          balance.token.hash,
          param.blockchain,
          exchange
        )

        const exchangeAmount = amountNumber * exchangeConvertedPrice

        tokensBalancesMap.set(service.tokenService.normalizeHash(balance.token.hash), {
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
      blockchain: param.blockchain,
      tokensBalancesMap,
    }
  } catch {
    return {
      address: param.address,
      blockchain: param.blockchain,
      tokensBalancesMap: new Map(),
    }
  }
}

const fixBalanceResult = (
  result: TUseBalancesFetchResult,
  showType: TUseBalanceOptionShowType,
  hiddenTokensByBlockchain: THiddenTokenByBlockchain
): TBalance => {
  const tokensBalancesMapClone = cloneDeep(result.tokensBalancesMap)
  const hiddenTokens = hiddenTokensByBlockchain[result.blockchain]
  const service = bsAggregator.blockchainServicesByName[result.blockchain]
  let tokensBalances: TTokenBalance[] = []

  match(showType)
    .with('active', () => {
      hiddenTokens?.forEach(tokenHash => {
        tokensBalancesMapClone.delete(service.tokenService.normalizeHash(tokenHash))
      })

      tokensBalances = Array.from(tokensBalancesMapClone.values())
    })
    .otherwise(() => {
      hiddenTokens?.forEach(tokenHash => {
        const tokenBalance = tokensBalancesMapClone.get(service.tokenService.normalizeHash(tokenHash))

        if (!tokenBalance) return

        tokensBalances.push(tokenBalance)
      })
    })

  return {
    address: result.address,
    blockchain: result.blockchain,
    tokensBalances,
    tokensBalancesMap: tokensBalancesMapClone,
    exchangeTotal: tokensBalances.reduce((acc, tokenBalance) => acc + tokenBalance.exchangeAmount, 0),
  }
}

export function useBalances(params: TUseBalancesParams[], options?: TUseBalancesOptions): TUseBalancesResult {
  const { showType = 'active', queryOptions } = options ?? {}

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
      ...queryOptions,
    })),
    combine: results => {
      const isLoading = isCurrencyRatioLoading || results.some(result => result.isLoading)
      const data: TBalance[] = []
      const groupedTokenBalances = new Map<string, TTokenBalance>()
      let exchangeTotal = 0

      if (!isLoading) {
        results.forEach(result => {
          if (!result.data) return

          const balance = fixBalanceResult(result.data, showType, hiddenTokensByBlockchain)
          data.push(balance)

          balance.tokensBalances.forEach(tokenBalance => {
            const groupedTokenBalance = groupedTokenBalances.get(tokenBalance.token.hash)

            if (!groupedTokenBalance) {
              groupedTokenBalances.set(tokenBalance.token.hash, tokenBalance)
              return
            }

            groupedTokenBalance.amountNumber += tokenBalance.amountNumber
            groupedTokenBalance.amount = BSBigNumberHelper.format(groupedTokenBalance.amountNumber, {
              decimals: tokenBalance.token.decimals,
            })
            groupedTokenBalance.exchangeAmount += tokenBalance.exchangeAmount
          })
        })

        exchangeTotal = data.reduce((acc, result) => acc + (result.exchangeTotal ?? 0), 0)
      }

      return {
        data,
        groupedTokenBalances: Array.from(groupedTokenBalances.values()),
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
  const { showType = 'active', queryOptions } = options ?? {}

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
    ...queryOptions,
  })

  const data = useMemo(() => {
    if (!query.data) return undefined

    return fixBalanceResult(query.data, showType, hiddenTokensByBlockchain)
  }, [showType, hiddenTokensByBlockchain, query.data])

  return {
    ...query,
    data,
  }
}

export function useLazyBalance() {
  const { networkByBlockchain } = useSelectedNetworkByBlockchainSelector()
  const queryClient = useQueryClient()
  const { currency } = useCurrencySelector()
  const currentRatioQuery = useCurrencyRatio()
  const { hiddenTokensByBlockchain } = useHiddenTokensByBlockchainSelector()

  const getBalance = useCallback(
    async (params: TUseBalancesParams, options?: TUseBalancesOptions) => {
      const { showType = 'active', queryOptions } = options ?? {}

      const network = networkByBlockchain[params.blockchain]

      const data = await queryClient.ensureQueryData({
        queryKey: buildQueryKeyBalance(params.address, params.blockchain, network, currency),
        queryFn: fetchBalance.bind(null, params, network, queryClient, currency, currentRatioQuery.data ?? 0),
        ...queryOptions,
      })

      return fixBalanceResult(data, showType, hiddenTokensByBlockchain)
    },
    [currency, currentRatioQuery.data, hiddenTokensByBlockchain, networkByBlockchain, queryClient]
  )

  return {
    getBalance,
  }
}
