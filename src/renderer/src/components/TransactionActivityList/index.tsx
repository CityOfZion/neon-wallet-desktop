import { useEffect } from 'react'

import { useVirtualizer } from '@tanstack/react-virtual'
import { useTranslation } from 'react-i18next'
import { match, P } from 'ts-pattern'

import { Separator } from '@renderer/components/Separator'

import { DateHelper } from '@renderer/helpers/DateHelper'

import { useInfiniteScroll } from '@renderer/hooks/useInfiniteScroll'
import { useLanguageSelector } from '@renderer/hooks/useSettingsSelector'
import { useTransactionActivityList } from '@renderer/hooks/useTransactionActivityList'
import { useTransactions } from '@renderer/hooks/useTransactions'

import TbAlertTriangle from '@renderer/assets/images/tb-alert-triangle.svg?react'

import { TransactionActivityListProvider } from '@renderer/contexts/TransactionActivityListContext'
import { SharedUtilsHelper } from '@shared/helpers/SharedUtilsHelper'
import { TTransactionActivityListItemColumnSize } from '@shared/types/contexts'
import { IAccountState } from '@shared/types/store'

import { TransactionActivityListDateRange } from './TransactionActivityListDateRange'
import { TransactionActivityListItems } from './TransactionActivityListItems'
import { TransactionActivityListSkeleton } from './TransactionActivityListSkeleton'

type TProps = {
  defaultAccounts: IAccountState[]
  dateFrom: Date
  dateTo: Date
  onSelectDateFrom: (date: Date) => void
  onSelectDateTo: (date: Date) => void
  shouldUseFullTransactionsService: boolean
}

const heights = {
  DATE: 40,
  DATE_GAP: 16,
  HEADER: 34,
  ITEM: 56,
  SEPARATOR: 1,
  SEPARATOR_MARGIN: 8,
  TRANSACTION_GAP: 16,
}

const Content = ({
  defaultAccounts,
  dateFrom,
  dateTo,
  onSelectDateFrom,
  onSelectDateTo,
  shouldUseFullTransactionsService,
}: TProps) => {
  const { t } = useTranslation('components', { keyPrefix: 'transactionActivityList' })
  const { setItemColumnSize } = useTransactionActivityList()
  const { language } = useLanguageSelector()

  const dateNow = new Date()

  const { data, isLoading, fetchNextPage } = useTransactions({
    accounts: defaultAccounts,
    dateFrom,
    dateTo,
    shouldUseFullTransactionsService,
  })

  const { handleScroll, ref: scrollRef } = useInfiniteScroll<HTMLDivElement>(fetchNextPage)

  const isDateDisabled = isLoading ? true : { after: dateNow }

  const handleScrollToTop = async () => {
    scrollRef.current?.scroll({ top: 0, behavior: 'instant' })

    await SharedUtilsHelper.sleep(200)
  }

  const handleSelectDateFrom = async (date: Date) => {
    await handleScrollToTop()

    onSelectDateFrom(date)
  }

  const handleSelectDateTo = async (date: Date) => {
    await handleScrollToTop()

    onSelectDateTo(date)
  }

  const virtualizer = useVirtualizer({
    count: data.length,
    gap: heights.DATE_GAP,
    getScrollElement: () => scrollRef.current,
    estimateSize: index => {
      const { transactions } = data[index] // Get the transactions for the current date group
      const transactionsLength = transactions.length // Number of transactions in this group

      // Base height includes date label, separator, and separator margin
      let height = heights.DATE + heights.SEPARATOR + heights.SEPARATOR_MARGIN

      // If there aren't transactions, return the base height
      if (transactionsLength === 0) return height

      // Add height for each header
      height += transactionsLength * heights.HEADER

      // Add gaps between transactions, except after the last one
      height += (transactionsLength - 1) * heights.TRANSACTION_GAP

      let itemsLength = 0

      // Calculate total number of items across all transactions in the group
      transactions.forEach(transaction => {
        if (transaction.view === 'utxo') {
          itemsLength += Math.max(transaction.inputs.length, transaction.outputs.length) + transaction.nfts.length

          return
        }

        itemsLength += transaction.events.length
      })

      // Add height for each item
      height += itemsLength * heights.ITEM

      return height // Return the final estimated height
    },
  })

  useEffect(() => {
    virtualizer._willUpdate()

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    virtualizer.measure()

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data])

  useEffect(() => {
    const scrollElement = scrollRef.current

    if (!scrollElement) return

    const resizeObserver = new ResizeObserver(([entry]) => {
      if (!entry) return

      const { width } = entry.contentRect

      setItemColumnSize(
        match(width)
          .with(
            P.when(value => value <= 822),
            () => 'xs'
          )
          .with(
            P.when(value => value <= 914),
            () => 'sm'
          )
          .with(
            P.when(value => value <= 1008),
            () => 'md'
          )
          .with(
            P.when(value => value <= 1120),
            () => 'lg'
          )
          .otherwise(() => 'xl') as TTransactionActivityListItemColumnSize
      )
    })

    resizeObserver.observe(scrollElement)

    return () => resizeObserver.disconnect()

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scrollRef.current])

  return (
    <div className="mt-2 flex min-h-0 w-full flex-col gap-y-2 text-sm">
      {shouldUseFullTransactionsService && (
        <div className="flex justify-end">
          <TransactionActivityListDateRange
            dateFrom={dateFrom}
            dateTo={dateTo}
            isDisabled={isDateDisabled}
            onSelectDateFrom={handleSelectDateFrom}
            onSelectDateTo={handleSelectDateTo}
          />
        </div>
      )}

      {match({ isLoading, data })
        .with({ isLoading: true }, () => <TransactionActivityListSkeleton />)
        .with({ data: [] }, () => (
          <section className="mt-16 flex flex-col items-center text-center">
            <TbAlertTriangle aria-hidden className="text-blue mb-2 h-16 w-16" />
            <h3 className="text-lg text-white">{t('notFoundTitle')}</h3>
            <p className="text-gray-300">{t('notFoundDescription')}</p>
          </section>
        ))
        .otherwise(() => (
          <div className="min-h-0 w-full overflow-x-hidden overflow-y-auto" ref={scrollRef} onScroll={handleScroll}>
            <ul className="relative flex w-full flex-col" style={{ height: `${virtualizer.getTotalSize()}px` }}>
              {virtualizer.getVirtualItems().map(virtualItem => {
                const { date, transactions } = data[virtualItem.index]

                return (
                  <li
                    key={virtualItem.key}
                    className="absolute top-0 left-0 flex w-full flex-col"
                    style={{
                      height: `${virtualItem.size}px`,
                      transform: `translateY(${virtualItem.start}px)`,
                    }}
                  >
                    <h3 className="flex h-10 max-h-10 min-h-10 items-center font-medium text-white">
                      {DateHelper.formatLocalized(date, {
                        format: t('dateRange.formatExtendedDate'),
                        language,
                      })}
                    </h3>

                    <Separator className="h-px max-h-px min-h-px" containerClassName="mb-2" />

                    {transactions.length > 0 && (
                      <ul className="flex flex-col gap-y-4">
                        {transactions.map(transaction => (
                          <TransactionActivityListItems key={transaction.txId} transaction={transaction} />
                        ))}
                      </ul>
                    )}
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
    </div>
  )
}

export const TransactionActivityList = (props: TProps) => (
  <TransactionActivityListProvider>
    <Content {...props} />
  </TransactionActivityListProvider>
)
