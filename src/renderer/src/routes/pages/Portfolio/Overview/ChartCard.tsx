import { useTranslation } from 'react-i18next'
import { BlockchainIcon } from '@renderer/components/BlockchainIcon'
import { EChart } from '@renderer/components/EChart'
import { Loader } from '@renderer/components/Loader'
import { Separator } from '@renderer/components/Separator'
import { NumberHelper } from '@renderer/helpers/NumberHelper'
import { StyleHelper } from '@renderer/helpers/StyleHelper'
import { useCurrencySelector } from '@renderer/hooks/useSettingsSelector'
import { bsAggregator } from '@renderer/libs/blockchainService'
import { TTokenBalance } from '@shared/@types/query'
import { TCurrency } from '@shared/@types/store'
import { useQuery } from '@tanstack/react-query'
import * as echarts from 'echarts/core'

type TProps = {
  token: TTokenBalance
}

const gradientColors = {
  neon: '#00DDB4',
  pink: '#E75595',
  asphalt: '#1A2026',
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
    <div className="w-[200px] h-[195px] flex flex-col bg-asphalt rounded py-2 px-3 gap-y-2 text-xs overflow-hidden">
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
                  <BlockchainIcon blockchain={token.blockchain} type="white" className="w-3 h-3" />
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
                <div className="space-x-1">
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
                  <span className="text-gray-300">{t('24h')}</span>
                </div>
              </div>

              <Separator />
            </div>

            <EChart
              option={{
                grid: {
                  height: 35,
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
                  scale: true,
                },
                series: [
                  {
                    type: 'line',
                    smooth: true,
                    itemStyle: {
                      color: query.data.dailyVariation >= 0 ? gradientColors.neon : gradientColors.pink,
                    },
                    showSymbol: false,

                    areaStyle: {
                      opacity: 0.2,
                      color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                        {
                          offset: 0,
                          color: query.data.dailyVariation >= 0 ? gradientColors.neon : gradientColors.pink,
                        },
                        {
                          offset: 1,
                          color: gradientColors.asphalt,
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
