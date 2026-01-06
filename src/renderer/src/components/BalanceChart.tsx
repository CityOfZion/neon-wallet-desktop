import { useMemo } from 'react'

import { useTranslation } from 'react-i18next'

import { CurrencyHelper } from '@renderer/helpers/CurrencyHelper'
import { StyleHelper } from '@renderer/helpers/StyleHelper'

import { useCurrencySelector } from '@renderer/hooks/useSettingsSelector'

import { TTokenBalance, TUseBalancesResult } from '@shared/types/query'

import { Tooltip } from './Tooltip'

type TProps = {
  balances: TUseBalancesResult
  sortedBalances: TTokenBalance[]
  className?: string
}

type TBar = {
  color: string
  widthPercent: number
  name: string
  value: string
}

export const BalanceChart = ({ balances, sortedBalances, className }: TProps) => {
  const { t } = useTranslation('components', { keyPrefix: 'balanceChart' })
  const { currency } = useCurrencySelector()

  const bars = useMemo<TBar[]>(() => {
    if (balances.exchangeTotal === 0) {
      return [
        {
          color: '#676767',
          name: t('noFinancialAssets'),
          value: CurrencyHelper.format(0, { currency }),
          widthPercent: 100,
        },
      ]
    }

    const firstFourBars = sortedBalances.slice(0, 4).map<TBar>(tokenBalance => {
      const color = StyleHelper.generateTokenColor(tokenBalance.token.hash, tokenBalance.blockchain)
      const widthPercent = (tokenBalance.exchangeAmount * 100) / balances.exchangeTotal

      return {
        name: tokenBalance.token.name,
        value: CurrencyHelper.format(tokenBalance.exchangeAmount, { currency }),
        color,
        widthPercent,
      }
    })

    if (sortedBalances.length <= 4) {
      return firstFourBars
    }

    const othersAmount = sortedBalances
      .slice(4)
      .reduce((accumulator, balance) => accumulator + balance.exchangeAmount, 0)

    const otherBar: TBar = {
      color: '#47BEFF',
      value: CurrencyHelper.format(othersAmount, { currency }),
      name: t('othersTokens'),
      widthPercent: (othersAmount * 100) / balances.exchangeTotal,
    }

    return [...firstFourBars, otherBar]
  }, [balances, t, currency, sortedBalances])

  const exchangeTotalFormatted = CurrencyHelper.format(balances.exchangeTotal, { currency })

  return (
    <div className={StyleHelper.mergeStyles('w-full py-9', className)}>
      <div className="mr-2 mb-9 flex w-full items-center justify-end gap-2 text-xl">
        <span className="text-gray-300">{t('balance')}</span>

        <span className="text-white">{exchangeTotalFormatted}</span>
      </div>

      <div className="flex w-full flex-col">
        <p className="mb-3.5 px-2 text-sm text-gray-100">{t('holdings')}</p>

        <ul className="flex w-full justify-center">
          {bars.map((bar, index) => (
            <li
              key={`${bar.name}-${bar.color}-${index}`}
              className="mx-2 flex min-w-20 flex-col"
              style={{
                width: `${bar.widthPercent}%`,
              }}
            >
              <div
                className="h-2 rounded-full bg-white drop-shadow-lg"
                style={{
                  backgroundImage: `linear-gradient(0deg, ${bar.color} 0%, ${bar.color}80 100%)`,
                }}
              />

              <div className="mt-5 flex min-w-0 items-start gap-2">
                <div
                  className="mt-1 h-2 w-2 min-w-2 rounded-full"
                  style={{
                    backgroundColor: bar.color,
                  }}
                />

                <span className="min-w-0 truncate text-xs font-normal text-white">{bar.name}</span>
              </div>

              <Tooltip title={bar.value}>
                <span className="max-w-fit truncate text-sm text-gray-300">{bar.value}</span>
              </Tooltip>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
