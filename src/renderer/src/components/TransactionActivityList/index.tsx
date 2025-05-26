import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { TbAlertTriangle } from 'react-icons/tb'
import { Separator } from '@renderer/components/Separator'
import { useActions } from '@renderer/hooks/useActions'
import { useGetFullTransactions } from '@renderer/hooks/useGetFullTransactions'
import { useInfiniteScroll } from '@renderer/hooks/useInfiniteScroll'
import { IAccountState } from '@shared/@types/store'
import { useVirtualizer } from '@tanstack/react-virtual'
import * as dateFns from 'date-fns'
import { match } from 'ts-pattern'

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

export const TransactionActivityList = ({ defaultAccounts }: TProps) => {
  const { t } = useTranslation('components', { keyPrefix: 'transactionActivityList' })

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

  const handleSelectDateFrom = (date: Date) => {
    setData({ dateFrom: date })

    if (dateTo && dateFns.isAfter(date, dateTo)) {
      setData({ dateTo: dateFns.min([dateNow, dateFns.add(date, { weeks: 1 })]) })

      return
    }

    if (dateTo && dateFns.differenceInYears(dateTo, date) > 0) {
      setData({ dateTo: dateFns.add(date, { years: 1, days: -1 }) })
    }
  }

  const handleSelectDateTo = (date: Date) => {
    setData({ dateTo: date })

    if (dateFrom && dateFns.isBefore(date, dateFrom)) {
      setData({ dateFrom: dateFns.sub(date, { weeks: 1 }) })

      return
    }

    if (dateFrom && dateFns.differenceInYears(date, dateFrom) > 0) {
      setData({ dateFrom: dateFns.sub(date, { years: 1, days: -1 }) })
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

  return (
    <div className="w-full flex flex-col gap-y-2 mt-2 min-h-0 text-sm">
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
          <section className="flex flex-col items-center text-center mt-16">
            <TbAlertTriangle aria-hidden={true} className="w-16 h-16 text-blue mb-2" />
            <h3 className="text-white text-lg">{t('notFoundTitle')}</h3>
            <p className="text-gray-300">{t('notFoundDescription')}</p>
          </section>
        ))
        .otherwise(() => (
          <div className="w-full min-h-0 overflow-y-auto overflow-x-hidden" ref={scrollRef} onScroll={handleScroll}>
            <ul className="flex flex-col w-full relative" style={{ height: `${virtualizer.getTotalSize()}px` }}>
              {virtualizer.getVirtualItems().map(virtualItem => {
                const { date, items } = data[virtualItem.index]

                return (
                  <li
                    key={virtualItem.key}
                    className="flex flex-col w-full absolute top-0 left-0"
                    style={{
                      height: `${virtualItem.size}px`,
                      transform: `translateY(${virtualItem.start}px)`,
                    }}
                  >
                    <h3 className="flex items-center text-white font-medium h-10 min-h-10 max-h-10">{date}</h3>

                    <Separator className="h-px min-h-px max-h-px" containerClassName="mb-2" />

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
