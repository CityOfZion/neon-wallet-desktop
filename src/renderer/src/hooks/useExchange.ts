import { useMemo } from 'react'
import { Token, TokenPricesResponse } from '@cityofzion/blockchain-service'
import { UtilsHelper } from '@renderer/helpers/UtilsHelper'
import { bsAggregator } from '@renderer/libs/blockchainService'
import { TBlockchainServiceKey, TNetwork } from '@shared/@types/blockchain'
import { TExchange, TMultiExchange, TUseExchangeParams, TUseExchangeResult } from '@shared/@types/query'
import { TSelectedNetworks } from '@shared/@types/store'
import { Query, QueryClient, useQueries, useQueryClient } from '@tanstack/react-query'
import lodash from 'lodash'

import { useCurrencyRatio } from './useCurrencyRatio'
import { useSelectedNetworkByBlockchainSelector } from './useSettingsSelector'

function buildQueryKey(blockchain: TBlockchainServiceKey, network: TNetwork<TBlockchainServiceKey>, token: Token) {
  return ['exchange', blockchain, network.id, UtilsHelper.normalizeHash(token.hash)]
}

function buildExchangeByBlockchainQueryKey(
  blockchain: TBlockchainServiceKey,
  network: TNetwork<TBlockchainServiceKey>
) {
  return ['exchange-by-blockchain', blockchain, network.id]
}

async function fetchExchange(
  blockchain: TBlockchainServiceKey,
  tokens: Token[],
  networkByBlockchain: TSelectedNetworks,
  queryClient: QueryClient,
  currencyRatio: number
) {
  const queryCache = queryClient.getQueryCache()

  const tokensToFetch = tokens.filter(token => {
    const queryKey = buildQueryKey(blockchain, networkByBlockchain[blockchain], token)

    const query = queryCache.find({ queryKey, exact: true, stale: false }) as Query<TExchange> | undefined

    return !query
  })

  let tokenPrices: TokenPricesResponse[] = []

  if (tokensToFetch.length > 0) {
    try {
      const service = bsAggregator.blockchainServicesByName[blockchain]
      tokenPrices = await service.exchangeDataService.getTokenPrices({ tokens: tokensToFetch })
    } catch {
      /* empty */
    }
  }

  tokensToFetch.forEach(token => {
    const normalizedHash = UtilsHelper.normalizeHash(token.hash)

    const tokenPrice = tokenPrices.find(price => UtilsHelper.normalizeHash(price.token.hash) === normalizedHash)

    const queryData: TExchange = {
      usdPrice: tokenPrice?.usdPrice ?? 0,
      token: tokenPrice?.token ?? token,
      convertedPrice: (tokenPrice?.usdPrice ?? 0) * currencyRatio,
    }

    const queryKey = buildQueryKey(blockchain, networkByBlockchain[blockchain], token)
    const defaultedOptions = queryClient.defaultQueryOptions({ queryKey })

    queryCache.build(queryClient, defaultedOptions).setData(queryData, { manual: true })
  })

  const allQueries = queryCache.findAll({
    queryKey: ['exchange', blockchain, networkByBlockchain[blockchain].id],
  }) as Query<TExchange>[]

  const result = {
    [blockchain]: new Map(allQueries.map(query => [query.queryKey[3] as string, query.state.data])),
  }

  return result
}

const emptyObject = {}

export function useExchange(params: TUseExchangeParams[]): TUseExchangeResult {
  const { networkByBlockchain } = useSelectedNetworkByBlockchainSelector()
  const queryClient = useQueryClient()

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
      {} as Record<TBlockchainServiceKey, Token[]>
    )
  }, [params])

  const currencyRatioQuery = useCurrencyRatio()

  const query = useQueries({
    queries:
      tokensToFetchByBlockchain && !currencyRatioQuery.isLoading
        ? Object.entries(tokensToFetchByBlockchain).map(([blockchain, tokens]) => ({
            queryKey: buildExchangeByBlockchainQueryKey(
              blockchain as TBlockchainServiceKey,
              networkByBlockchain[blockchain]
            ),
            queryFn: fetchExchange.bind(
              null,
              blockchain as TBlockchainServiceKey,
              tokens,
              networkByBlockchain,
              queryClient,
              currencyRatioQuery.data ?? 1
            ),
            staleTime: 0,
          }))
        : [],
    combine: result => ({
      isLoading: result.some(query => query.isLoading),
      data: lodash.assign(emptyObject, ...result.map(query => query.data ?? {})) as TMultiExchange,
    }),
  })

  return query
}
