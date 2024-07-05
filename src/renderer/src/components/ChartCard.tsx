import { useTranslation } from 'react-i18next'
import { BlockchainIcon } from '@renderer/components/BlockchainIcon'
import { EChart } from '@renderer/components/EChart'
import { Separator } from '@renderer/components/Separator'
import { NumberHelper } from '@renderer/helpers/NumberHelper'
import { StyleHelper } from '@renderer/helpers/StyleHelper'
import { useCurrencySelector } from '@renderer/hooks/useSettingsSelector'
import { TPriceHistory } from '@shared/@types/query'
import * as echarts from 'echarts/core'

type TProps = {
  priceHistory: TPriceHistory
}

const gradientColors = {
  neon: '#00DDB4',
  pink: '#E75595',
  almostBlack: '#13191B',
}

export const ChartCard = ({ priceHistory }: TProps) => {
  const { t } = useTranslation('components', { keyPrefix: 'chartCard' })
  const { currency } = useCurrencySelector()

  return (
    <div className="min-w-[200px] grow w-full h-[205px] flex flex-col bg-gray-900 rounded py-2 px-3 gap-y-1.5 text-xs overflow-hidden">
      <div className="flex items-center gap-x-2 mb-1.5">
        <div className="bg-gray-600 rounded-full w-6 h-6 flex items-center justify-center p-1.5">
          <BlockchainIcon blockchain={priceHistory.tokenBalance.blockchain} type="white" />
        </div>

        <div>{priceHistory.tokenBalance.token.name}</div>
        <div className="text-gray-300">({priceHistory.tokenBalance.token.symbol})</div>
      </div>

      <Separator />

      <div className="flex flex-col">
        <span className="text-gray-300">{t('holdings')}</span>
        <span>{priceHistory.tokenBalance.amount}</span>
      </div>

      <Separator />

      <div className="flex flex-col">
        <span className="text-lg">{NumberHelper.currency(priceHistory.todayPrice, currency.label)}</span>
        <div className="space-x-1">
          <span
            className={StyleHelper.mergeStyles('', {
              'text-neon': priceHistory.dailyVariation >= 0,
              'text-pink': priceHistory.dailyVariation < 0,
            })}
          >
            {t('variation', {
              variation: priceHistory.dailyVariation.toFixed(2),
              variationType: Math.sign(priceHistory.dailyVariation) >= 0 ? '+' : '',
            })}
          </span>
          <span className="text-gray-300">{t('24h')}</span>
        </div>
      </div>

      <Separator />

      <EChart
        option={{
          grid: {
            height: 40,
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
          },
          xAxis: {
            show: false,
            type: 'category',
            data: priceHistory.sortedPricesByTimestamp,
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
                color: priceHistory.dailyVariation >= 0 ? gradientColors.neon : gradientColors.pink,
              },
              showSymbol: false,
              areaStyle: {
                opacity: 0.2,
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                  {
                    offset: 0,
                    color: priceHistory.dailyVariation >= 0 ? gradientColors.neon : gradientColors.pink,
                  },
                  {
                    offset: 1,
                    color: gradientColors.almostBlack,
                  },
                ]),
              },
              data: priceHistory.sortedPrices,
            },
          ],
        }}
      />
    </div>
  )
}
