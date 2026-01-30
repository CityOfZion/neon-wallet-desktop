import { useQuery } from '@tanstack/react-query'

import { BlockchainServiceHelper } from '@renderer/helpers/BlockchainServiceHelper'
import { LoggerHelper } from '@renderer/helpers/LoggerHelper'

import { useCurrencySelector } from '@renderer/hooks/useSettingsSelector'

import { TBlockchainServiceKey } from '@shared/types/blockchain'
import { TUseCurrencyRatioResult } from '@shared/types/query'
import { TCurrency } from '@shared/types/store'

// There is no need to fetch currency ratio from multiple blockchains
const blockchain: TBlockchainServiceKey = 'neo3'

const fetchCurrencyRatio = async (currency: TCurrency): Promise<number> => {
  let currencyRatio = 1

  try {
    if (currency.label !== 'USD') {
      const service = BlockchainServiceHelper.bsAggregator.blockchainServicesByName[blockchain]

      currencyRatio = await service.exchangeDataService.getCurrencyRatio(currency.label)
    }
  } catch (error) {
    LoggerHelper.error(error, { where: 'useCurrencyRatio', operation: 'fetchCurrencyRatio' })
  }

  return currencyRatio
}

export function useCurrencyRatio(): TUseCurrencyRatioResult {
  const { currency } = useCurrencySelector()

  return useQuery({
    queryKey: ['currency-ratio', currency],
    queryFn: fetchCurrencyRatio.bind(null, currency),
  })
}
