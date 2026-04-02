import { ReactNode } from 'react'

import orderBy from 'lodash/orderBy'
import { Fragment } from 'react/jsx-runtime'

import { StyleHelper } from '@renderer/helpers/StyleHelper'

import { TUseBalancesResult } from '@shared/types/query'
import { TAccount } from '@shared/types/store'

import { BalanceChart } from './BalanceChart'
import { ChartCardList } from './ChartCardList'
import { EmptyState } from './EmptyState'
import { Loader } from './Loader'
import { Separator } from './Separator'

type TProps = {
  account?: TAccount
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
  const sortedBalances = orderBy(balances.groupedTokenBalances, ['exchangeAmount'], ['desc'])

  return (
    <div className="flex w-full grow flex-col">
      {balances.isLoading ? (
        <Loader className="size-10" containerClassName="mt-12" />
      ) : balances.groupedTokenBalances.length > 0 ? (
        <Fragment key={account?.address}>
          <BalanceChart
            balances={balances}
            sortedBalances={sortedBalances}
            className={StyleHelper.mergeStyles('flex flex-col', balanceChartClassName)}
          />

          {children}

          <Separator />

          <ChartCardList
            sortedBalances={sortedBalances}
            className={StyleHelper.mergeStyles('flex flex-col', chartCardListClassName)}
          />
        </Fragment>
      ) : (
        <EmptyState account={account} />
      )}
    </div>
  )
}
