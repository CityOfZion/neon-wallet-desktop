import { ExchangeHelper } from '@renderer/helpers/ExchangeHelper'
import { NumberHelper } from '@renderer/helpers/NumberHelper'
import { useCurrencyRatio } from '@renderer/hooks/useCurrencyRatio'
import { bsAggregator } from '@renderer/libs/blockchainService'
import { TBlockchainServiceKey, TNetwork } from '@shared/@types/blockchain'
import {
  TBalance,
  TTokenBalance,
  TUseBalanceResult,
  TUseBalancesParams,
  TUseBalancesResult,
} from '@shared/@types/query'
import { TCurrency } from '@shared/@types/store'
import { QueryClient, useQueries, useQuery, useQueryClient } from '@tanstack/react-query'

import { fetchExchange } from './useExchange'
import { useCurrencySelector, useSelectedNetworkByBlockchainSelector } from './useSettingsSelector'

export function buildQueryKeyBalance(
  address: string,
  blockchain: TBlockchainServiceKey,
  network: TNetwork<TBlockchainServiceKey>,
  currency: TCurrency
) {
  return ['balance', address, blockchain, network.id, currency]
}

const fetchBalance = async (
  param: TUseBalancesParams,
  network: TNetwork<TBlockchainServiceKey>,
  queryClient: QueryClient,
  currency: TCurrency,
  currencyRatio: number
): Promise<TBalance> => {
  try {
    const service = bsAggregator.blockchainServicesByName[param.blockchain]
    const balance = await service.blockchainDataService.getBalance(param.address)
    const tokens = balance.map(balance => balance.token)
    const exchange = await fetchExchange(param.blockchain, tokens, network, queryClient, currency, currencyRatio)

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
  const { isLoading: isCurrencyRatioLoading, data: currencyRatio } = useCurrencyRatio()
  const { currency } = useCurrencySelector()

  return useQueries({
    queries: params.map(param => ({
      queryKey: buildQueryKeyBalance(param.address, param.blockchain, networkByBlockchain[param.blockchain], currency),
      queryFn: fetchBalance.bind(
        null,
        param,
        networkByBlockchain[param.blockchain],
        queryClient,
        currency,
        currencyRatio
      ),
      enabled: !isCurrencyRatioLoading && typeof currencyRatio === 'number',
    })),
    combine: results => ({
      data: results.map(result => result.data).filter((balance): balance is TBalance => !!balance),
      isLoading: isCurrencyRatioLoading || results.some(result => result.isLoading),
      exchangeTotal: results.reduce((acc, result) => acc + (result.data?.exchangeTotal ?? 0), 0),
    }),
  })
}

export function useBalance(balanceParams: TUseBalancesParams | undefined): TUseBalanceResult {
  const { networkByBlockchain } = useSelectedNetworkByBlockchainSelector()
  const queryClient = useQueryClient()
  const { currency } = useCurrencySelector()
  const { isLoading: isCurrencyRatioLoading, data: currencyRatio } = useCurrencyRatio()
  const params = balanceParams ?? { address: '', blockchain: 'neo3' }

  return useQuery({
    queryKey: buildQueryKeyBalance(params.address, params.blockchain, networkByBlockchain[params.blockchain], currency),
    queryFn: fetchBalance.bind(
      null,
      params,
      networkByBlockchain[params.blockchain],
      queryClient,
      currency,
      currencyRatio
    ),
    enabled: !!balanceParams && !isCurrencyRatioLoading && typeof currencyRatio === 'number',
  })
}
