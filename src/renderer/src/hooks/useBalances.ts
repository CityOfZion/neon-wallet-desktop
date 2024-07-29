import { useMemo } from 'react'
import { ExchangeHelper } from '@renderer/helpers/ExchangeHelper'
import { NumberHelper } from '@renderer/helpers/NumberHelper'
import { bsAggregator } from '@renderer/libs/blockchainService'
import { TFetchBalanceResponse, TTokenBalance, TUseBalancesParams, TUseBalancesResult } from '@shared/@types/query'
import { useQueries } from '@tanstack/react-query'

import { useExchange } from './useExchange'
import { useSelectedNetworkByBlockchainSelector } from './useSettingsSelector'

const fetchBalance = async (param: TUseBalancesParams): Promise<TFetchBalanceResponse> => {
  try {
    const service = bsAggregator.blockchainServicesByName[param.blockchain]
    const balance = await service.blockchainDataService.getBalance(param.address)

    return {
      address: param.address,
      balance,
      blockchain: param.blockchain,
    }
  } catch {
    return {
      address: param.address,
      balance: [],
      blockchain: param.blockchain,
    }
  }
}

export function useBalances(params: TUseBalancesParams[]): TUseBalancesResult {
  const { networkByBlockchain } = useSelectedNetworkByBlockchainSelector()

  const balanceQueries = useQueries({
    queries: params.map(param => ({
      queryKey: ['balance', param.address, param.blockchain, networkByBlockchain[param.blockchain].id],
      queryFn: fetchBalance.bind(null, param),
    })),
    combine: results => {
      const data = results.map(result => result.data).filter(data => data !== undefined) as TFetchBalanceResponse[]

      return {
        data,
        exchangeParam: data.map(item => ({
          blockchain: item.blockchain,
          tokens: item.balance.map(balance => balance.token),
        })),
        isLoading: results.some(result => result.isLoading),
      }
    },
  })

  const exchangeQuery = useExchange(balanceQueries.isLoading ? [] : balanceQueries.exchangeParam)

  const data = useMemo(() => {
    const result: TUseBalancesResult = {
      data: [],
      exchangeTotal: 0,
      isLoading: balanceQueries.isLoading || exchangeQuery.isLoading,
    }

    if (result.isLoading) return result

    balanceQueries.data.forEach(queryData => {
      const tokensBalances: TTokenBalance[] = []
      let exchangeTotal = 0

      for (const balance of queryData.balance) {
        const exchangeConvertedPrice = ExchangeHelper.getExchangeConvertedPrice(
          balance.token.hash,
          queryData.blockchain,
          exchangeQuery.data
        )

        const amountNumber = NumberHelper.number(balance.amount)
        const exchangeAmount = amountNumber * exchangeConvertedPrice

        exchangeTotal += exchangeAmount

        tokensBalances.push({
          ...balance,
          blockchain: queryData.blockchain,
          amount: balance.amount,
          amountNumber,
          exchangeAmount,
          exchangeConvertedPrice,
        })
      }

      result.data.push({ address: queryData.address, tokensBalances, exchangeTotal })
      result.exchangeTotal += exchangeTotal
    })

    return result
  }, [balanceQueries.data, balanceQueries.isLoading, exchangeQuery.data, exchangeQuery.isLoading])

  return data
}
