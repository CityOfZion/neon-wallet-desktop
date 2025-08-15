import { useMemo } from 'react'
import { BSTokenHelper } from '@cityofzion/blockchain-service'
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
  TUseBalancesFetchResult,
  TUseBalancesOptions,
  TUseBalancesParams,
  TUseBalancesResult,
} from '@shared/@types/query'
import { TCurrency, THiddenTokenByBlockchain } from '@shared/@types/store'
import { QueryClient, useQueries, useQuery, useQueryClient } from '@tanstack/react-query'
import { cloneDeep } from 'lodash'
import { match } from 'ts-pattern'

import { fetchExchange } from './useExchange'
import { useCurrencySelector, useSelectedNetworkByBlockchainSelector } from './useSettingsSelector'
import { useHiddenTokensByBlockchainSelector } from './useUtilitySelector'

export function buildQueryKeyBalance(
  address: string,
  blockchain: TBlockchainServiceKey,
  network: TNetwork<TBlockchainServiceKey>,
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
  network: TNetwork<TBlockchainServiceKey>,
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
        const exchangeConvertedPrice = ExchangeHelper.getExchangeConvertedPrice(
          balance.token.hash,
          param.blockchain,
          exchange
        )

        const amountNumber = NumberHelper.number(balance.amount)
        const exchangeAmount = amountNumber * exchangeConvertedPrice

        tokensBalancesMap.set(BSTokenHelper.normalizeHash(balance.token.hash), {
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
  const tokenBalancesMapClone = cloneDeep(result.tokensBalancesMap)
  const hiddenTokens = hiddenTokensByBlockchain[result.blockchain]
  let tokensBalances: TTokenBalance[] = []

  match(showType)
    .with('active', () => {
      hiddenTokens?.forEach(tokenHash => {
        tokenBalancesMapClone.delete(BSTokenHelper.normalizeHash(tokenHash))
      })
      tokensBalances = Array.from(tokenBalancesMapClone.values())
    })
    .otherwise(() => {
      hiddenTokens?.forEach(tokenHash => {
        const tokenBalance = tokenBalancesMapClone.get(BSTokenHelper.normalizeHash(tokenHash))
        if (!tokenBalance) return
        tokensBalances.push(tokenBalance)
      })
    })

  return {
    address: result.address,
    blockchain: result.blockchain,
    tokensBalances,
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
      let exchangeTotal = 0

      if (!isLoading) {
        results.forEach(result => {
          if (!result.data) return

          data.push(fixBalanceResult(result.data, showType, hiddenTokensByBlockchain))
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
