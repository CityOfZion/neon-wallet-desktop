import { BlockchainService, TokenPricesResponse } from '@cityofzion/blockchain-service'
import { TBlockchainServiceKey } from '@renderer/@types/blockchain'
import { TBaseOptions, TUseExchangeResult } from '@renderer/@types/query'
import { TCurrency } from '@renderer/@types/store'
import { bsAggregator } from '@renderer/libs/blockchainService'
import { useQueries } from '@tanstack/react-query'
import lodash from 'lodash'

import { useCurrencySelector, useNetworkTypeSelector } from './useSettingsSelector'

const fetchExchange = async (
  service: BlockchainService<TBlockchainServiceKey>,
  currency: TCurrency
): Promise<Record<string, TokenPricesResponse[]>> => {
  const results = await service.exchangeDataService.getTokenPrices(currency.label as any)
  return { [service.blockchainName]: results }
}

export function useExchange(
  queryOptions?: TBaseOptions<Record<TBlockchainServiceKey, TokenPricesResponse[]>>
): TUseExchangeResult {
  const { networkType } = useNetworkTypeSelector()
  const { currency } = useCurrencySelector()

  const query = useQueries({
    queries: Object.values(bsAggregator.blockchainServicesByName).map(service => ({
      queryKey: ['exchange', service.blockchainName, networkType],
      queryFn: fetchExchange.bind(null, service, currency),
      ...queryOptions,
    })),
    combine: results => ({
      data: lodash.merge({}, ...results.map(result => result.data)),
      isLoading: results.some(result => result.isLoading),
    }),
  })

  return query
}
