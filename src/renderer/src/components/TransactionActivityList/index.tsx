import { useEffect } from 'react'

import { useVirtualizer } from '@tanstack/react-virtual'
import * as dateFns from 'date-fns'
import { useTranslation } from 'react-i18next'
import { match, P } from 'ts-pattern'

import { Separator } from '@renderer/components/Separator'

import { DateHelper } from '@renderer/helpers/DateHelper'

import { useActions } from '@renderer/hooks/useActions'
import { useGetFullTransactions } from '@renderer/hooks/useGetFullTransactions'
import { useInfiniteScroll } from '@renderer/hooks/useInfiniteScroll'
import { useLanguageSelector } from '@renderer/hooks/useSettingsSelector'
import { useTransactionActivityList } from '@renderer/hooks/useTransactionActivityList'

import TbAlertTriangle from '@renderer/assets/images/tb-alert-triangle.svg?react'

import { TransactionActivityListProvider } from '@renderer/contexts/TransactionActivityListContext'
import { SharedUtilsHelper } from '@shared/helpers/SharedUtilsHelper'
import { TTransactionActivityListEventColumnSize } from '@shared/types/contexts'
import { IAccountState } from '@shared/types/store'

import { TransactionActivityListDateRange } from './TransactionActivityListDateRange'
import { TransactionActivityListItem } from './TransactionActivityListItem'
import { TransactionActivityListSkeleton } from './TransactionActivityListSkeleton'

type TActionsData = {
  accounts: IAccountState[]
  dateFrom: Date
  dateTo: Date
}

type TProps = {
  defaultAccounts: IAccountState[]
}

const heights = {
  DATE: 40,
  DATE_GAP: 16,
  HEADER: 34,
  EVENT: 53,
  SEPARATOR: 1,
  SEPARATOR_MARGIN: 8,
  TRANSACTION_GAP: 16,
}

const Content = ({ defaultAccounts }: TProps) => {
  const { t } = useTranslation('components', { keyPrefix: 'transactionActivityList' })
  const { setEventColumnSize } = useTransactionActivityList()
  const { language } = useLanguageSelector()

  const dateNow = new Date()

  const { actionData, setData } = useActions<TActionsData>({
    accounts: defaultAccounts,
    dateFrom: dateFns.startOfMonth(dateNow),
    dateTo: dateNow,
  })

  const { data, isLoading, fetchNextPage } = useGetFullTransactions(actionData)
  const { handleScroll, ref: scrollRef } = useInfiniteScroll<HTMLDivElement>(fetchNextPage)

  const { dateFrom, dateTo } = actionData

  const isDateDisabled = isLoading ? true : { after: dateNow }

  const handleScrollToTop = async () => {
    scrollRef.current?.scroll({ top: 0, behavior: 'instant' })

    await SharedUtilsHelper.sleep(200)
  }

  const handleSelectDateFrom = async (date: Date) => {
    await handleScrollToTop()

    const newDateFrom = dateFns.startOfDay(date)

    setData({ dateFrom: newDateFrom })

    if (dateTo && dateFns.isAfter(newDateFrom, dateTo)) {
      const dateNow = new Date()
      const newDateTo = dateFns.endOfDay(dateFns.min([dateNow, dateFns.add(newDateFrom, { weeks: 1 })]))

      setData({ dateTo: dateFns.isSameDay(dateNow, newDateTo) ? dateNow : newDateTo })

      return
    }

    if (dateTo && dateFns.differenceInYears(dateTo, newDateFrom) > 0) {
      const dateNow = new Date()
      const newDateTo = dateFns.endOfDay(dateFns.add(newDateFrom, { years: 1, days: -1 }))

      setData({ dateTo: dateFns.isSameDay(dateNow, newDateTo) ? dateNow : newDateTo })
    }
  }

  const handleSelectDateTo = async (date: Date) => {
    await handleScrollToTop()

    const dateNow = new Date()
    const newDateTo = dateFns.isSameDay(dateNow, date) ? dateNow : dateFns.endOfDay(date)

    setData({ dateTo: newDateTo })

    if (dateFrom && dateFns.isBefore(newDateTo, dateFrom)) {
      setData({ dateFrom: dateFns.startOfDay(dateFns.sub(newDateTo, { weeks: 1 })) })

      return
    }

    if (dateFrom && dateFns.differenceInYears(newDateTo, dateFrom) > 0) {
      setData({ dateFrom: dateFns.startOfDay(dateFns.sub(newDateTo, { years: 1, days: -1 })) })
    }
  }

  const virtualizer = useVirtualizer({
    count: data.length,
    gap: heights.DATE_GAP,
    getScrollElement: () => scrollRef.current,
    estimateSize: index => {
      const { items } = data[index] // Get the transactions (items) for the current date group
      const itemsLength = items.length // Number of transactions (items) in this group

      // Base height includes date label, separator, and separator margin
      let height = heights.DATE + heights.SEPARATOR + heights.SEPARATOR_MARGIN

      // If there aren't transactions (items), return the base height
      if (itemsLength === 0) return height

      // Add height for each header
      height += itemsLength * heights.HEADER

      // Add gaps between transactions (items), except after the last one
      height += (itemsLength - 1) * heights.TRANSACTION_GAP

      // Calculate total number of events across all items in the group
      const eventsLength = items.flatMap(({ events }) => events).length

      // Add height for each event
      height += eventsLength * heights.EVENT

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
  }, [actionData])

  useEffect(() => {
    const scrollElement = scrollRef.current

    if (!scrollElement) return

    const resizeObserver = new ResizeObserver(([entry]) => {
      if (!entry) return

      const { width } = entry.contentRect

      setEventColumnSize(
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
          .otherwise(() => 'xl') as TTransactionActivityListEventColumnSize
      )
    })

    resizeObserver.observe(scrollElement)

    return () => resizeObserver.disconnect()

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scrollRef.current])

  return (
    <div className="mt-2 flex min-h-0 w-full flex-col gap-y-2 text-sm">
      <div className="flex justify-end">
        <TransactionActivityListDateRange
          dateFrom={dateFrom}
          dateTo={dateTo}
          isDisabled={isDateDisabled}
          onSelectDateFrom={handleSelectDateFrom}
          onSelectDateTo={handleSelectDateTo}
        />
      </div>

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
                const { date, items } = data[virtualItem.index]

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

                    {items.length > 0 && (
                      <ul className="flex flex-col gap-y-4">
                        {items.map((item, index) => (
                          <TransactionActivityListItem key={`${item.txId}-${index}`} item={item} />
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
