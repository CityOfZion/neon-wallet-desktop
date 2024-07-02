import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { NumberHelper } from '@renderer/helpers/NumberHelper'
import { StyleHelper } from '@renderer/helpers/StyleHelper'
import { UtilsHelper } from '@renderer/helpers/UtilsHelper'
import { useCurrencySelector } from '@renderer/hooks/useSettingsSelector'
import { TTokenBalance, TUseBalancesResult } from '@shared/@types/query'

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
    if (balances.exchangeTotal === 0)
      return [
        { color: '#676767', name: t('noAssets'), value: NumberHelper.currency(0, currency.label), widthPercent: 100 },
      ]

    const firstFourBars = sortedBalances.slice(0, 4).map<TBar>(tokenBalance => {
      const color = UtilsHelper.generateTokenColor(tokenBalance.token.hash)
      const widthPercent = (tokenBalance.exchangeAmount * 100) / balances.exchangeTotal

      return {
        name: tokenBalance.token.name,
        value: NumberHelper.currency(tokenBalance.exchangeAmount, currency.label),
        color,
        widthPercent,
      }
    })

    if (sortedBalances.length <= 4) {
      return firstFourBars
    }

    const othersAmount = sortedBalances.slice(4).reduce((acc, balance) => acc + balance.exchangeAmount, 0)
    const otherBar: TBar = {
      color: '#47BEFF',
      value: NumberHelper.currency(othersAmount, currency.label),
      name: t('othersTokens'),
      widthPercent: (othersAmount * 100) / balances.exchangeTotal,
    }

    return [...firstFourBars, otherBar]
  }, [balances, t, currency, sortedBalances])

  const exchangeTotalFormatted = NumberHelper.currency(balances.exchangeTotal, currency.label, 2, 2, false)

  return (
    <div className={StyleHelper.mergeStyles('w-full pt-7 pb-9', className)}>
      <div className="w-full flex justify-end flex-grow">
        <div className="flex gap-2 text-xl mr-2">
          <span className="text-gray-300">{t('balance')}</span>

          <span className=" text-white">{exchangeTotalFormatted}</span>
        </div>
      </div>

      <div className="w-full flex flex-col">
        <p className="text-sm text-gray-100 mb-3.5 px-2">{t('holdings')}</p>

        <ul className="flex w-full justify-center">
          {bars.map(bar => (
            <li
              key={bar.name}
              className="flex flex-col mx-2 min-w-[5rem]"
              style={{
                width: `${bar.widthPercent}%`,
              }}
            >
              <div
                className="h-2 w-full rounded-full drop-shadow-lg bg-white"
                style={{
                  backgroundImage: `linear-gradient(0deg, ${bar.color} 0%, ${bar.color}80 100%)`,
                }}
              ></div>
              <div className="flex items-start mt-5">
                <div
                  className="w-2 min-w-[0.5rem] h-2 rounded-full mt-1"
                  style={{
                    backgroundColor: bar.color,
                  }}
                ></div>
                <div className="flex flex-col pl-2 min-w-0">
                  <span className="text-white text-xs font-normal truncate">{bar.name}</span>
                  <span className="text-gray-300 text-sm">{bar.value}</span>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
