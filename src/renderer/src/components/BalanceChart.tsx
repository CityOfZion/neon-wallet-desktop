import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { TTokenBalance, TUseBalancesResult } from '@renderer/@types/query'
import { IAccountState } from '@renderer/@types/store'
import { NumberHelper } from '@renderer/helpers/NumberHelper'
import { UtilsHelper } from '@renderer/helpers/UtilsHelper'
import { useCurrencySelector } from '@renderer/hooks/useSettingsSelector'

import { EmptyState } from './EmptyState'
import { Loader } from './Loader'

type TProps = {
  balances: TUseBalancesResult
  account?: IAccountState
  tokenBalance: TTokenBalance[]
}

type TBar = {
  color: string
  widthPercent: number
  name: string
  value: string
}

export const BalanceChart = ({ balances, account, tokenBalance }: TProps) => {
  const { t } = useTranslation('components', { keyPrefix: 'balanceChart' })
  const { currency } = useCurrencySelector()

  const bars = useMemo<TBar[] | undefined>(() => {
    if (balances.isLoading) return undefined

    if (balances.exchangeTotal === 0)
      return [
        { color: '#676767', name: t('noAssets'), value: NumberHelper.currency(0, currency.label), widthPercent: 100 },
      ]

    const firstFourBars = tokenBalance.slice(0, 4).map<TBar>(tokenBalance => {
      const color = UtilsHelper.generateTokenColor(tokenBalance.token.hash)
      const widthPercent = (tokenBalance.exchangeAmount * 100) / balances.exchangeTotal
      return {
        name: tokenBalance.token.name,
        value: NumberHelper.currency(tokenBalance.exchangeAmount, currency.label),
        color,
        widthPercent,
      }
    })

    if (tokenBalance.length <= 4) {
      return firstFourBars
    }

    const othersAmount = tokenBalance.slice(4).reduce((acc, balance) => acc + balance.exchangeAmount, 0)
    const otherBar: TBar = {
      color: '#47BEFF',
      value: NumberHelper.currency(othersAmount, currency.label),
      name: t('othersTokens'),
      widthPercent: (othersAmount * 100) / balances.exchangeTotal,
    }

    return [...firstFourBars, otherBar]
  }, [balances, t, currency, tokenBalance])

  if (bars === undefined) {
    return <Loader />
  }

  return (
    <ul className="flex w-full justify-center">
      {balances.exchangeTotal !== 0 ? (
        bars.map(bar => (
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
        ))
      ) : (
        <EmptyState account={account} />
      )}
    </ul>
  )
}
