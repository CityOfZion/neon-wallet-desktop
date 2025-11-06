import * as echarts from 'echarts/core'
import { useTranslation } from 'react-i18next'

import { EChart } from '@renderer/components/EChart'
import { ImageWithFallback } from '@renderer/components/ImageWithFallback'
import { Separator } from '@renderer/components/Separator'

import { NumberHelper } from '@renderer/helpers/NumberHelper'
import { StyleHelper } from '@renderer/helpers/StyleHelper'

import { useCurrencySelector } from '@renderer/hooks/useSettingsSelector'

import { NEON_ICONS_URL } from '@renderer/constants/urls'
import { TPriceHistory } from '@shared/types/query'

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

  const { tokenBalance } = priceHistory
  const { token } = tokenBalance

  return (
    <div className="flex h-[205px] w-full grow flex-col gap-y-1.5 overflow-hidden rounded-sm bg-gray-900 px-3 py-2 text-xs">
      <div className="mb-1.5 flex items-center gap-x-2">
        <ImageWithFallback
          src={`${NEON_ICONS_URL}/tokens/${tokenBalance.blockchain}/${token.hash}.png`}
          alt={token.name || token.symbol}
          fallbackSrc={`${NEON_ICONS_URL}/tokens/default-token.png`}
          imgClassName="h-4.5 max-h-4.5 min-h-4.5 w-4.5 max-w-4.5 min-w-4.5 rounded-full"
          className="h-6 w-6 rounded-full bg-gray-600/50"
        />

        <div>{token.name}</div>
        <div className="text-gray-300">({token.symbol})</div>
      </div>

      <Separator />

      <div className="flex flex-col">
        <span className="text-gray-300">{t('holdings')}</span>
        <span>{tokenBalance.amount}</span>
      </div>

      <Separator />

      <div className="flex flex-col">
        <span className="text-lg">
          {NumberHelper.currency(priceHistory.todayPrice, { currency, maximumFractionDigits: 4 })}
        </span>
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
