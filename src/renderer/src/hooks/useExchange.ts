import { useMemo } from 'react'

import { TBSToken, TTokenPricesResponse } from '@cityofzion/blockchain-service'
import { Query, QueryClient, useQueries, useQueryClient } from '@tanstack/react-query'
import lodash from 'lodash'

import { useCurrencyRatio } from '@renderer/hooks/useCurrencyRatio'

import { bsAggregator } from '@renderer/libs/blockchain-service'
import { TBlockchainServiceKey, TNetwork } from '@shared/@types/blockchain'
import { TExchange, TMultiExchange, TUseExchangeParams, TUseExchangeResult } from '@shared/@types/query'
import { TCurrency } from '@shared/@types/store'

import { useCurrencySelector, useSelectedNetworkByBlockchainSelector } from './useSettingsSelector'

function buildQueryKey(blockchain: TBlockchainServiceKey, network: TNetwork, currency: TCurrency, token?: TBSToken) {
  const queryKey = ['exchange', blockchain, network, currency]

  if (token) {
    const service = bsAggregator.blockchainServicesByName[blockchain]

    queryKey.push(service.tokenService.normalizeHash(token.hash))
  }

  return queryKey
}

function buildExchangeByBlockchainQueryKey(blockchain: TBlockchainServiceKey, network: TNetwork, currency: TCurrency) {
  return ['exchange-by-blockchain', blockchain, network, currency]
}

export async function fetchExchange(
  blockchain: TBlockchainServiceKey,
  tokens: TBSToken[],
  network: TNetwork,
  queryClient: QueryClient,
  currency: TCurrency,
  currencyRatio: number
) {
  const queryCache = queryClient.getQueryCache()
  const service = bsAggregator.blockchainServicesByName[blockchain]

  const tokensToFetch = tokens.filter(token => {
    const queryKey = buildQueryKey(blockchain, network, currency, token)
    const query = queryCache.find({ queryKey, exact: true, stale: false }) as Query<TExchange> | undefined

    return !query
  })

  let tokenPrices: TTokenPricesResponse[] = []

  if (tokensToFetch.length > 0) {
    try {
      const newTokenPrices = await service.exchangeDataService.getTokenPrices({ tokens: tokensToFetch })

      tokenPrices = lodash.uniqBy(newTokenPrices, 'token.hash')
    } catch {
      /* empty */
    }
  }

  tokensToFetch.forEach(token => {
    const queryKey = buildQueryKey(blockchain, network, currency, token)
    const tokenPrice = tokenPrices.find(price => service.tokenService.predicateByHash(token, price.token))
    const currentQuery = queryCache.find<TExchange>({ queryKey, exact: true })
    const currentUsdPrice = currentQuery?.state?.data?.usdPrice
    let nextUsdPrice = tokenPrice?.usdPrice

    if (typeof currentUsdPrice === 'number' && currentUsdPrice !== 0 && nextUsdPrice === undefined) {
      return
    }

    if (!nextUsdPrice) {
      nextUsdPrice = 0
    }

    const queryData: TExchange = {
      usdPrice: nextUsdPrice,
      token: tokenPrice?.token ?? token,
      convertedPrice: nextUsdPrice * currencyRatio,
    }

    const defaultedOptions = queryClient.defaultQueryOptions({ queryKey })

    queryCache.build(queryClient, defaultedOptions).setData(queryData, { manual: true })
  })

  const allQueries = queryCache.findAll({
    queryKey: buildQueryKey(blockchain, network, currency),
  }) as Query<TExchange>[]

  return {
    [blockchain]: new Map(
      allQueries.map(({ state, queryKey: [_key, _blockchain, _network, _currency, token] }) => [
        token as string,
        state.data,
      ])
    ),
  }
}

const emptyObject = {}

export function useExchange(params: TUseExchangeParams[]): TUseExchangeResult {
  const { networkByBlockchain } = useSelectedNetworkByBlockchainSelector()
  const queryClient = useQueryClient()
  const { currency } = useCurrencySelector()
  const { isLoading: isCurrencyRatioLoading, data: currencyRatio } = useCurrencyRatio()

  const tokensToFetchByBlockchain = useMemo(() => {
    if (params.length === 0) return

    return params.reduce(
      (acc, param) => {
        if (acc[param.blockchain]) {
          const noDuplicates = param.tokens.filter(token => !acc[param.blockchain].some(t => t.hash === token.hash))
          acc[param.blockchain].push(...noDuplicates)
        } else {
          acc[param.blockchain] = param.tokens
        }

        return acc
      },
      {} as Record<TBlockchainServiceKey, TBSToken[]>
    )
  }, [params])

  return useQueries({
    queries: Object.entries(tokensToFetchByBlockchain ?? {}).map(([key, tokens]) => {
      const blockchain = key as TBlockchainServiceKey
      const network = networkByBlockchain[blockchain]

      return {
        queryKey: buildExchangeByBlockchainQueryKey(blockchain, network, currency),
        queryFn: fetchExchange.bind(null, blockchain, tokens, network, queryClient, currency, currencyRatio ?? 0),
        enabled: !isCurrencyRatioLoading && typeof currencyRatio === 'number',
      }
    }),
    combine: result => ({
      isLoading: isCurrencyRatioLoading || result.some(query => query.isLoading),
      data: lodash.assign(emptyObject, ...result.map(query => query.data ?? {})) as TMultiExchange,
    }),
  })
}
