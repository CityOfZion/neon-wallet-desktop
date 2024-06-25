import { useTranslation } from 'react-i18next'
import { TTokenBalance } from '@renderer/@types/query'
import { TCurrency } from '@renderer/@types/store'
import { BlockchainIcon } from '@renderer/components/BlockchainIcon'
import { EChart } from '@renderer/components/EChart'
import { Loader } from '@renderer/components/Loader'
import { Separator } from '@renderer/components/Separator'
import { NumberHelper } from '@renderer/helpers/NumberHelper'
import { StyleHelper } from '@renderer/helpers/StyleHelper'
import { useCurrencySelector } from '@renderer/hooks/useSettingsSelector'
import { bsAggregator } from '@renderer/libs/blockchainService'
import { useQuery } from '@tanstack/react-query'
import * as echarts from 'echarts/core'

type TProps = {
  token: TTokenBalance
}

const gradientColors: Record<string, (opacity: number) => string> = {
  neon: (opacity: number) => `rgba(0, 221, 180, ${opacity})`,
  pink: (opacity: number) => `rgba(231, 85, 149, ${opacity})`,
}

const fetchTokenData = async (token: TTokenBalance, currency: TCurrency) => {
  const service = bsAggregator.blockchainServicesByName[token.blockchain]

  const prices = await service.exchangeDataService.getTokenPriceHistory({
    currency: currency.label as any,
    tokenSymbol: token.token.symbol,
    limit: 24,
    type: 'hour',
  })

  const sortedPrices = prices.sort((a, b) => a.price - b.price)

  const min = sortedPrices[0].price
  const max = sortedPrices[sortedPrices.length - 1].price

  const sortedPricesByTimestamp = prices.sort((a, b) => a.timestamp - b.timestamp)

  const oldPrice = sortedPricesByTimestamp[0].price
  const todayPrice = sortedPricesByTimestamp[sortedPricesByTimestamp.length - 1].price
  const dailyVariation = ((todayPrice - oldPrice) / oldPrice) * 100

  return {
    min,
    max,
    todayPrice,
    dailyVariation,
    sortedPrices: sortedPricesByTimestamp.map(item => item.price),
    sortedPricesByTimestamp: sortedPricesByTimestamp.map(item => item.timestamp),
  }
}

export const ChartCard = ({ token }: TProps) => {
  const { t } = useTranslation('components', { keyPrefix: 'chartCard' })
  const { currency } = useCurrencySelector()

  const query = useQuery({
    queryKey: ['prices', token.token.symbol],
    queryFn: fetchTokenData.bind(null, token, currency),
    staleTime: 0,
    retry: false,
  })

  return (
    <div className="w-[220px] h-[205px] flex flex-col bg-asphalt rounded py-2 px-3 gap-y-2 text-xs overflow-hidden">
      {query.isLoading ? (
        <div className="flex h-full justify-center items-center">
          <Loader className="w-4 h-4" />
        </div>
      ) : query.error ? (
        <div className="flex justify-center mt-4">
          <p className="text-gray-300">{t('unableToFetchData')}</p>
        </div>
      ) : (
        query.data && (
          <div className="flex flex-col justify-between gap-y-2">
            <div className="flex flex-col gap-y-1.5">
              <div className="flex items-center gap-x-2">
                <div className="bg-gray-600 rounded-full p-1">
                  <BlockchainIcon blockchain={token.blockchain} type="white" />
                </div>
                <div>{token.token.name}</div>
                <div className="text-gray-300">({token.token.symbol})</div>
              </div>

              <Separator />

              <div className="flex flex-col">
                <span className="text-gray-300">{t('holdings')}</span>
                <span>{token.amount}</span>
              </div>

              <Separator />

              <div className="flex flex-col">
                <span className="text-lg">{NumberHelper.currency(query.data.todayPrice, currency.label)}</span>
                <span
                  className={StyleHelper.mergeStyles('', {
                    'text-neon': query.data.dailyVariation >= 0,
                    'text-pink': query.data.dailyVariation < 0,
                  })}
                >
                  {t('variation', {
                    variation: query.data.dailyVariation.toFixed(2),
                    variationType: Math.sign(query.data.dailyVariation) >= 0 ? '+' : '',
                  })}
                </span>
              </div>

              <Separator />
            </div>

            <EChart
              option={{
                grid: {
                  height: 30,
                  top: 0,
                  bottom: 0,
                  left: 0,
                  right: 0,
                },
                xAxis: {
                  show: false,
                  type: 'category',
                  data: query.data.sortedPricesByTimestamp,
                },
                yAxis: {
                  show: false,
                  type: 'value',
                  max: query.data.max,
                  min: query.data.min,
                },
                series: [
                  {
                    type: 'line',
                    smooth: true,
                    itemStyle: {
                      color: query.data.dailyVariation >= 0 ? gradientColors.neon(1) : gradientColors.pink(1),
                    },
                    showSymbol: false,
                    areaStyle: {
                      color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                        {
                          offset: 0.5,
                          color: query.data.dailyVariation >= 0 ? gradientColors.neon(0.3) : gradientColors.pink(0.3),
                        },
                        {
                          offset: 1,
                          color: query.data.dailyVariation >= 0 ? gradientColors.neon(0) : gradientColors.pink(0),
                        },
                      ]),
                    },
                    data: query.data.sortedPrices,
                  },
                ],
              }}
            />
          </div>
        )
      )}
    </div>
  )
}
