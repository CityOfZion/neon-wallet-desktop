import { bsAggregator } from '@renderer/libs/blockchainService'
import { TPriceHistory, TTokenBalance, TUsePriceHistoryResult } from '@shared/@types/query'
import { TCurrency } from '@shared/@types/store'
import { useQueries } from '@tanstack/react-query'

import { useCurrencySelector } from './useSettingsSelector'

const fetchTokenData = async (tokenBalance: TTokenBalance, currency: TCurrency): Promise<TPriceHistory> => {
  const service = bsAggregator.blockchainServicesByName[tokenBalance.blockchain]

  const prices = await service.exchangeDataService.getTokenPriceHistory({
    currency: currency.label as any,
    tokenSymbol: tokenBalance.token.symbol,
    limit: 24,
    type: 'hour',
  })

  const sortedPricesByTimestamp = prices.sort((a, b) => a.timestamp - b.timestamp)

  const oldPrice = sortedPricesByTimestamp[0].price
  const todayPrice = sortedPricesByTimestamp[sortedPricesByTimestamp.length - 1].price
  const dailyVariation = ((todayPrice - oldPrice) / oldPrice) * 100

  return {
    tokenBalance,
    todayPrice,
    dailyVariation,
    sortedPrices: sortedPricesByTimestamp.map(item => item.price),
    sortedPricesByTimestamp: sortedPricesByTimestamp.map(item => item.timestamp),
  }
}

export const usePriceHistory = (tokenBalances: TTokenBalance[]): TUsePriceHistoryResult => {
  const { currency } = useCurrencySelector()

  return useQueries({
    queries: tokenBalances.map(tokenBalance => ({
      queryKey: ['prices', tokenBalance.token.symbol, currency],
      queryFn: fetchTokenData.bind(null, tokenBalance, currency),
      staleTime: 0,
      retry: false,
    })),
    combine: results => ({
      data: results.map(result => result.data).filter((data): data is TPriceHistory => !!data),
      isLoading: results.some(result => result.isLoading),
    }),
  })
}
