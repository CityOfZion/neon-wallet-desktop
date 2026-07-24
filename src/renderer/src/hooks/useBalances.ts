import { useCallback, useMemo } from 'react'

import { BSBigHumanAmount } from '@cityofzion/blockchain-service'
import { QueryClient, useQueries, useQuery, useQueryClient } from '@tanstack/react-query'
import { cloneDeep } from 'lodash'
import { match } from 'ts-pattern'

import { BlockchainServiceHelper } from '@renderer/helpers/BlockchainServiceHelper'
import { ExchangeHelper } from '@renderer/helpers/ExchangeHelper'
import { NumberHelper } from '@renderer/helpers/NumberHelper'
import { TokenHelper } from '@renderer/helpers/TokenHelper'

import { useCurrencyRatio } from '@renderer/hooks/useCurrencyRatio'

import { TBlockchainServiceKey, TNetwork } from '@shared/types/blockchain'
import {
  TBalance,
  TTokenBalance,
  TUseBalanceOptionShowType,
  TUseBalanceResult,
  TUseBalancesFetchResult,
  TUseBalancesOptions,
  TUseBalancesParams,
  TUseBalancesResult,
} from '@shared/types/query'
import { TCurrency, THiddenTokenByBlockchain } from '@shared/types/store'

import { fetchExchange } from './useExchange'
import { useCurrencySelector, useSelectedNetworkByBlockchainSelector } from './useSettingsSelector'
import { useHiddenTokensByBlockchainSelector } from './useUtilitySelector'

export function buildQueryKeyBalance(
  address: string,
  blockchain: TBlockchainServiceKey,
  network: TNetwork,
  currency?: TCurrency,
  hasCurrencyRatio?: boolean
) {
  const key: any[] = ['balance', address, blockchain, network]

  if (currency) {
    key.push(currency)

    if (hasCurrencyRatio !== undefined) {
      key.push(hasCurrencyRatio)
    }
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
  const { address, blockchain } = param

  try {
    const service = BlockchainServiceHelper.bsAggregator.blockchainServicesByName[blockchain]
    const balance = await service.blockchainDataService.getBalance(address)
    const tokens = balance.map(balance => balance.token)
    const exchange = await fetchExchange(blockchain, tokens, network, queryClient, currency, currencyRatio)
    const tokensBalancesMap: Map<string, TTokenBalance> = new Map()

    await Promise.allSettled(
      balance.map(async balance => {
        const amountNumber = NumberHelper.number(balance.amount)

        if (isNaN(amountNumber) || amountNumber <= 0) return

        const exchangeConvertedPrice = ExchangeHelper.getExchangeConvertedPrice(
          balance.token.hash,
          blockchain,
          exchange
        )

        const exchangeAmount = amountNumber * exchangeConvertedPrice

        tokensBalancesMap.set(TokenHelper.getKey(balance.token.hash, blockchain), {
          ...balance,
          blockchain,
          amount: balance.amount,
          amountNumber,
          exchangeAmount,
          exchangeConvertedPrice,
        })
      })
    )

    return {
      address,
      blockchain,
      tokensBalancesMap,
    }
  } catch {
    return {
      address,
      blockchain,
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
  const service = BlockchainServiceHelper.bsAggregator.blockchainServicesByName[result.blockchain]
  let tokensBalances: TTokenBalance[] = []

  match(showType)
    .with('active', () => {
      if (hiddenTokens) {
        for (const [key, { token }] of tokensBalancesMapClone) {
          const { hash } = token

          if (hiddenTokens.some(tokenHash => service.tokenService.predicateByHash(tokenHash, hash))) {
            tokensBalancesMapClone.delete(key)
          }
        }
      }

      tokensBalances = Array.from(tokensBalancesMapClone.values())
    })
    .otherwise(() => {
      if (hiddenTokens) {
        for (const [, tokenBalance] of tokensBalancesMapClone) {
          const tokenHash = tokenBalance.token.hash

          if (hiddenTokens.some(hiddenHash => service.tokenService.predicateByHash(hiddenHash, tokenHash))) {
            tokensBalances.push(tokenBalance)
          }
        }
      }
    })

  return {
    address: result.address,
    blockchain: result.blockchain,
    tokensBalances,
    tokensBalancesMap: tokensBalancesMapClone,
    exchangeTotal: tokensBalances.reduce((accumulator, tokenBalance) => accumulator + tokenBalance.exchangeAmount, 0),
  }
}

export function useBalances(params: TUseBalancesParams[], options?: TUseBalancesOptions): TUseBalancesResult {
  const { showType = 'active', queryOptions } = options || {}

  const { networkByBlockchain } = useSelectedNetworkByBlockchainSelector()
  const queryClient = useQueryClient()
  const { isLoading: isCurrencyRatioLoading, data: currencyRatio } = useCurrencyRatio()
  const { currency } = useCurrencySelector()
  const { hiddenTokensByBlockchain } = useHiddenTokensByBlockchainSelector()

  const hasCurrencyRatio = typeof currencyRatio === 'number'

  return useQueries({
    queries: params.map(param => ({
      queryKey: buildQueryKeyBalance(
        param.address,
        param.blockchain,
        networkByBlockchain[param.blockchain],
        currency,
        hasCurrencyRatio
      ),
      queryFn: fetchBalance.bind(
        null,
        param,
        networkByBlockchain[param.blockchain],
        queryClient,
        currency,
        currencyRatio || 0
      ),
      enabled: !isCurrencyRatioLoading && hasCurrencyRatio,
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
            const { token, blockchain } = tokenBalance
            const groupedTokenBalance = groupedTokenBalances.get(TokenHelper.getKey(token.hash, blockchain))

            if (!groupedTokenBalance) {
              groupedTokenBalances.set(TokenHelper.getKey(token.hash, blockchain), tokenBalance)

              return
            }

            groupedTokenBalance.amountNumber += tokenBalance.amountNumber
            groupedTokenBalance.amount = new BSBigHumanAmount(
              groupedTokenBalance.amountNumber,
              token.decimals
            ).toFormatted()
            groupedTokenBalance.exchangeAmount += tokenBalance.exchangeAmount
          })
        })

        exchangeTotal = data.reduce((accumulator, result) => accumulator + (result.exchangeTotal || 0), 0)
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

  const params = balanceParams || { address: '', blockchain: 'neo3' }
  const { showType = 'active', queryOptions } = options || {}
  const hasCurrencyRatio = typeof currencyRatio === 'number'

  const query = useQuery({
    queryKey: buildQueryKeyBalance(
      params.address,
      params.blockchain,
      networkByBlockchain[params.blockchain],
      currency,
      hasCurrencyRatio
    ),
    queryFn: fetchBalance.bind(
      null,
      params,
      networkByBlockchain[params.blockchain],
      queryClient,
      currency,
      currencyRatio || 0
    ),
    enabled: !!balanceParams && !isCurrencyRatioLoading && hasCurrencyRatio,
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

  const hasCurrencyRatio = typeof currentRatioQuery.data === 'number'

  const getBalance = useCallback(
    async (params: TUseBalancesParams, options?: TUseBalancesOptions) => {
      const { showType = 'active', queryOptions } = options || {}

      const network = networkByBlockchain[params.blockchain]

      const data = await queryClient.ensureQueryData({
        queryKey: buildQueryKeyBalance(params.address, params.blockchain, network, currency, hasCurrencyRatio),
        queryFn: fetchBalance.bind(null, params, network, queryClient, currency, currentRatioQuery.data || 0),
        ...queryOptions,
      })

      return fixBalanceResult(data, showType, hiddenTokensByBlockchain)
    },
    [currency, currentRatioQuery.data, hasCurrencyRatio, hiddenTokensByBlockchain, networkByBlockchain, queryClient]
  )

  return {
    getBalance,
  }
}
