import { ReactNode, useMemo } from 'react'
import { Fragment } from 'react/jsx-runtime'
import { NumberHelper } from '@renderer/helpers/NumberHelper'
import { StyleHelper } from '@renderer/helpers/StyleHelper'
import { TTokenBalance, TUseBalancesResult } from '@shared/@types/query'
import { IAccountState } from '@shared/@types/store'
import { cloneDeep } from 'lodash'

import { BalanceChart } from './BalanceChart'
import { ChartCardList } from './ChartCardList'
import { EmptyState } from './EmptyState'
import { Loader } from './Loader'
import { Separator } from './Separator'

type TProps = {
  account?: IAccountState
  balances: TUseBalancesResult
  balanceChartClassName?: string
  chartCardListClassName?: string
  children?: ReactNode
}

export const OverviewCharts = ({
  balances,
  account,
  children,
  balanceChartClassName,
  chartCardListClassName,
}: TProps) => {
  const sortedBalances = useMemo(() => {
    const tokensBalances = balances.data.map(balance => balance.tokensBalances).flat()

    const map = new Map<string, TTokenBalance>()

    tokensBalances.forEach(balance => {
      if (balance.exchangeAmount <= 0) return

      const repeated = map.get(balance.token.hash)
      if (repeated) {
        repeated.amountNumber += balance.amountNumber
        repeated.exchangeAmount += balance.exchangeAmount
        repeated.amount = NumberHelper.removeLeadingZero(repeated.amountNumber.toFixed(repeated.token.decimals))
        return
      }

      map.set(balance.token.hash, cloneDeep(balance))
    })

    const tokenBalancesSorted = Array.from(map.values()).sort(
      (token1, token2) => token2.exchangeAmount - token1.exchangeAmount
    )
    return tokenBalancesSorted
  }, [balances])

  return (
    <div className="flex flex-col flex-grow justify-center w-full">
      {balances.isLoading ? (
        <Loader className="w-10 h-10" />
      ) : balances.exchangeTotal !== 0 ? (
        <Fragment key={account?.address}>
          <BalanceChart
            balances={balances}
            sortedBalances={sortedBalances}
            className={StyleHelper.mergeStyles('h-2/5 flex flex-col justify-center', balanceChartClassName)}
          />

          {children}

          <Separator />

          <ChartCardList
            sortedBalances={sortedBalances}
            className={StyleHelper.mergeStyles('flex-grow flex flex-col justify-center', chartCardListClassName)}
          />
        </Fragment>
      ) : (
        <EmptyState account={account} />
      )}
    </div>
  )
}
