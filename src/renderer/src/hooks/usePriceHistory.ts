import { useQueries } from '@tanstack/react-query'

import { BlockchainServiceHelper } from '@renderer/helpers/BlockchainServiceHelper'

import { useCurrencyRatio } from '@renderer/hooks/useCurrencyRatio'

import { TPriceHistory, TTokenBalance, TUsePriceHistoryResult } from '@shared/types/query'

import { useCurrencySelector, useSelectedNetworkByBlockchainSelector } from './useSettingsSelector'

const fetchTokenData = async (tokenBalance: TTokenBalance, currencyRatio: number): Promise<TPriceHistory | null> => {
  try {
    const service = BlockchainServiceHelper.bsAggregator.blockchainServicesByName[tokenBalance.blockchain]
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
  const { networkByBlockchain } = useSelectedNetworkByBlockchainSelector()

  return useQueries({
    queries: tokenBalances.map(tokenBalance => {
      const { blockchain } = tokenBalance

      return {
        queryKey: ['prices', blockchain, tokenBalance.token.symbol, currency, networkByBlockchain[blockchain]],
        queryFn: fetchTokenData.bind(null, tokenBalance, currencyRatio || 0),
        enabled: !isCurrencyRatioLoading && typeof currencyRatio === 'number',
      }
    }),
    combine: results => ({
      data: results.map(result => result.data).filter((data): data is TPriceHistory => !!data),
      isLoading: isCurrencyRatioLoading || results.some(result => result.isLoading),
    }),
  })
}
