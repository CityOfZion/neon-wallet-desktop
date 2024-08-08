import { ExchangeHelper } from '@renderer/helpers/ExchangeHelper'
import { NumberHelper } from '@renderer/helpers/NumberHelper'
import { bsAggregator } from '@renderer/libs/blockchainService'
import { TBlockchainServiceKey, TNetwork } from '@shared/@types/blockchain'
import { TBalance, TTokenBalance, TUseBalancesParams, TUseBalancesResult } from '@shared/@types/query'
import { Query, QueryClient, useQueries, useQueryClient } from '@tanstack/react-query'

import { useCurrencyRatio } from './useCurrencyRatio'
import { fetchExchange } from './useExchange'
import { useSelectedNetworkByBlockchainSelector } from './useSettingsSelector'

export function verifyIfQueryIsBalance(
  query: Query,
  addressCompare: string[],
  blockchainCompare: TBlockchainServiceKey[],
  networkIdCompare: string[]
): boolean {
  const queryKey = query.queryKey as [string, string, TBlockchainServiceKey, string]

  return (
    queryKey[0] === 'balance' &&
    addressCompare.includes(queryKey[1]) &&
    blockchainCompare.includes(queryKey[2]) &&
    networkIdCompare.includes(queryKey[3])
  )
}

export function buildQueryKeyBalance(
  address: string,
  blockchain: TBlockchainServiceKey,
  network: TNetwork<TBlockchainServiceKey>
): string[] {
  return ['balance', address, blockchain, network.id]
}

const fetchBalance = async (
  param: TUseBalancesParams,
  network: TNetwork<TBlockchainServiceKey>,
  queryClient: QueryClient,
  currencyRatio: number
): Promise<TBalance> => {
  try {
    const service = bsAggregator.blockchainServicesByName[param.blockchain]
    const balance = await service.blockchainDataService.getBalance(param.address)

    const tokens = balance.map(balance => balance.token)
    const exchange = await fetchExchange(param.blockchain, tokens, network, queryClient, currencyRatio)

    const tokensBalances: TTokenBalance[] = []
    let exchangeTotal = 0

    await Promise.allSettled(
      balance.map(async balance => {
        const exchangeConvertedPrice = ExchangeHelper.getExchangeConvertedPrice(
          balance.token.hash,
          param.blockchain,
          exchange
        )
        const amountNumber = NumberHelper.number(balance.amount)
        const exchangeAmount = amountNumber * exchangeConvertedPrice

        exchangeTotal += exchangeAmount
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
      exchangeTotal,
    }
  } catch {
    return {
      address: param.address,
      tokensBalances: [],
      exchangeTotal: 0,
    }
  }
}

export function useBalances(params: TUseBalancesParams[]): TUseBalancesResult {
  const { networkByBlockchain } = useSelectedNetworkByBlockchainSelector()
  const queryClient = useQueryClient()
  const currencyRatioQuery = useCurrencyRatio()

  const balanceQueries = useQueries({
    queries: currencyRatioQuery
      ? params.map(param => ({
          queryKey: buildQueryKeyBalance(param.address, param.blockchain, networkByBlockchain[param.blockchain]),
          queryFn: fetchBalance.bind(
            null,
            param,
            networkByBlockchain[param.blockchain],
            queryClient,
            currencyRatioQuery.data ?? 1
          ),
        }))
      : [],
    combine: results => ({
      data: results.map(result => result.data).filter((balance): balance is TBalance => !!balance),
      isLoading: currencyRatioQuery.isLoading || results.some(result => result.isLoading),
      exchangeTotal: results.reduce((acc, result) => acc + (result.data?.exchangeTotal ?? 0), 0),
    }),
  })

  return balanceQueries
}
