import { bsAggregator } from '@renderer/libs/blockchainService'
import { TBlockchainServiceKey } from '@shared/@types/blockchain'
import { TBaseOptions, TUseCurrencyRatioResult } from '@shared/@types/query'
import { TCurrency } from '@shared/@types/store'
import { useQuery } from '@tanstack/react-query'

import { useCurrencySelector, useSelectedNetworkSelector } from './useSettingsSelector'

// There is no need to get ratio from multiple blockchains
const blockchain: TBlockchainServiceKey = 'neo3'

const fetchRatio = async (currency: TCurrency): Promise<number> => {
  try {
    if (currency.label === 'USD') {
      return 1
    }

    const service = bsAggregator.blockchainServicesByName[blockchain]
    const ratio = await service.exchangeDataService.getCurrencyRatio(currency.label)
    return ratio
  } catch {
    return 1
  }
}

export function useCurrencyRatio(queryOptions?: TBaseOptions<number>): TUseCurrencyRatioResult {
  const { network } = useSelectedNetworkSelector(blockchain)
  const { currency } = useCurrencySelector()

  const query = useQuery({
    queryKey: ['currency-ratio', currency, network.id],
    queryFn: fetchRatio.bind(null, currency),
    ...queryOptions,
  })

  return query
}
