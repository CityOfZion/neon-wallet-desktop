import { ExchangeHelper } from '@renderer/helpers/ExchangeHelper'
import { NumberHelper } from '@renderer/helpers/NumberHelper'
import { bsAggregator } from '@renderer/libs/blockchainService'
import { TBlockchainServiceKey, TNetwork } from '@shared/@types/blockchain'
import { TBalance, TTokenBalance, TUseBalancesParams, TUseBalancesResult } from '@shared/@types/query'
import { QueryClient, useQueries, useQueryClient } from '@tanstack/react-query'

import { useCurrencyRatio } from './useCurrencyRatio'
import { fetchExchange } from './useExchange'
import { useSelectedNetworkByBlockchainSelector } from './useSettingsSelector'

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
          queryKey: ['balance', param.address, param.blockchain, networkByBlockchain[param.blockchain].id],
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
