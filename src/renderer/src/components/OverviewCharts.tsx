import { ReactNode } from 'react'

import orderBy from 'lodash/orderBy'
import { Fragment } from 'react/jsx-runtime'

import { StyleHelper } from '@renderer/helpers/StyleHelper'

import { usePriceHistory } from '@renderer/hooks/usePriceHistory'

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

  const priceHistories = usePriceHistory(
    sortedBalances.filter(
      (item, index, array) =>
        array.findIndex(({ token, blockchain }) => {
          return token.symbol === item.token.symbol && token.hash === item.token.hash && blockchain === item.blockchain
        }) === index
    )
  )

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

          {(priceHistories.isLoading || priceHistories.data.length > 0) && (
            <Fragment>
              <Separator />

              <ChartCardList
                priceHistory={priceHistories.data}
                isLoading={priceHistories.isLoading}
                className={StyleHelper.mergeStyles('flex flex-col', chartCardListClassName)}
              />
            </Fragment>
          )}
        </Fragment>
      ) : (
        <EmptyState account={account} />
      )}
    </div>
  )
}
