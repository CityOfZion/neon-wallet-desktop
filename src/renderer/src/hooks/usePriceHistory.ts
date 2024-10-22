import { useCurrencyRatio } from '@renderer/hooks/useCurrencyRatio'
import { bsAggregator } from '@renderer/libs/blockchainService'
import { TPriceHistory, TTokenBalance, TUsePriceHistoryResult } from '@shared/@types/query'
import { useQueries } from '@tanstack/react-query'

import { useCurrencySelector } from './useSettingsSelector'

const fetchTokenData = async (tokenBalance: TTokenBalance, currencyRatio: number): Promise<TPriceHistory | null> => {
  try {
    const service = bsAggregator.blockchainServicesByName[tokenBalance.blockchain]
    const prices = await service.exchangeDataService.getTokenPriceHistory({
      token: tokenBalance.token,
      limit: 24,
      type: 'hour',
    })

    const convertedAndSortedPricesByTimestamp = prices
      .map(item => ({ ...item, currencyPrice: item.usdPrice * currencyRatio }))
      .sort((a, b) => a.timestamp - b.timestamp)

    const oldPrice = convertedAndSortedPricesByTimestamp[0].currencyPrice
    const todayPrice = convertedAndSortedPricesByTimestamp[convertedAndSortedPricesByTimestamp.length - 1].currencyPrice
    const dailyVariation = ((todayPrice - oldPrice) / oldPrice) * 100

    return {
      tokenBalance,
      todayPrice,
      dailyVariation,
      sortedPrices: convertedAndSortedPricesByTimestamp.map(item => item.currencyPrice),
      sortedPricesByTimestamp: convertedAndSortedPricesByTimestamp.map(item => item.timestamp),
    }
  } catch {
    return null
  }
}

export const usePriceHistory = (tokenBalances: TTokenBalance[]): TUsePriceHistoryResult => {
  const { currency } = useCurrencySelector()
  const { isLoading: isCurrencyRatioLoading, data: currencyRatio } = useCurrencyRatio()

  return useQueries({
    queries: tokenBalances.map(tokenBalance => ({
      queryKey: ['prices', tokenBalance.token.symbol, currency],
      queryFn: fetchTokenData.bind(null, tokenBalance, currencyRatio),
      staleTime: 0,
      retry: false,
      enabled: !isCurrencyRatioLoading && typeof currencyRatio === 'number',
    })),
    combine: results => ({
      data: results.map(result => result.data).filter((data): data is TPriceHistory => !!data),
      isLoading: isCurrencyRatioLoading || results.some(result => result.isLoading),
    }),
  })
}
