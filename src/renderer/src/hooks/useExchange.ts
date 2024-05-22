import { TokenPricesResponse } from '@cityofzion/blockchain-service'
import { TBlockchainServiceKey } from '@renderer/@types/blockchain'
import { TBaseOptions, TMultiExchange, TUseExchangeResult } from '@renderer/@types/query'
import { TCurrency } from '@renderer/@types/store'
import { bsAggregator } from '@renderer/libs/blockchainService'
import { useQuery } from '@tanstack/react-query'

import { useCurrencySelector, useNetworkTypeSelector } from './useSettingsSelector'

const fetchExchange = async (currency: TCurrency): Promise<TMultiExchange> => {
  const result: TMultiExchange = {
    ethereum: [],
    neo3: [],
    neoLegacy: [],
  }

  await Promise.all(
    Object.values(bsAggregator.blockchainServicesByName).map(async service => {
      result[service.blockchainName] = await service.exchangeDataService.getTokenPrices(currency.label as any)
    })
  )

  return result
}

export function useExchange(
  queryOptions?: TBaseOptions<Record<TBlockchainServiceKey, TokenPricesResponse[]>>
): TUseExchangeResult {
  const { networkType } = useNetworkTypeSelector()
  const { currency } = useCurrencySelector()

  const query = useQuery({
    queryKey: ['exchange', networkType],
    queryFn: fetchExchange.bind(null, currency),
    ...queryOptions,
  })

  return {
    data: query.data,
    isLoading: query.isLoading,
  }
}
