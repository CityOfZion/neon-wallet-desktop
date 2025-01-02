import { forwardRef, useImperativeHandle, useMemo } from 'react'
import { MdContentCopy } from 'react-icons/md'
import { TbChevronRight, TbTransform } from 'react-icons/tb'
import { hasExplorerService } from '@cityofzion/blockchain-service'
import { AccountHelper } from '@renderer/helpers/AccountHelper'
import { StringHelper } from '@renderer/helpers/StringHelper'
import { StyleHelper } from '@renderer/helpers/StyleHelper'
import { UtilsHelper } from '@renderer/helpers/UtilsHelper'
import { usePendingTransactionsSelector, useSwapRecordsSelector } from '@renderer/hooks/useAuthSelector'
import { useInfiniteScroll } from '@renderer/hooks/useInfiniteScroll'
import { useModalNavigate } from '@renderer/hooks/useModalRouter'
import { useTokenTransfers } from '@renderer/hooks/useTokenTransfers'
import { bsAggregator } from '@renderer/libs/blockchainService'
import { getI18next } from '@renderer/libs/i18next'
import { TUseTransactionsTransfer } from '@shared/@types/hooks'
import { IAccountState } from '@shared/@types/store'
import { createColumnHelper, flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table'
import { format } from 'date-fns'

import { BlockchainIcon } from './BlockchainIcon'
import { Button } from './Button'
import { Loader } from './Loader'
import { Table } from './Table'

type TTransactionListProps = {
  accounts: IAccountState[]
  showSimplified?: boolean
  tableHeaderClassName?: string
}

const { t } = getI18next()

const columnHelper = createColumnHelper<TUseTransactionsTransfer>()

export const TransactionsTable = forwardRef<HTMLDivElement, TTransactionListProps>(
  ({ accounts, showSimplified, tableHeaderClassName }, ref) => {
    const { aggregatedData, fetchNextPage, isLoading } = useTokenTransfers({ accounts })

    const { pendingTransactions } = usePendingTransactionsSelector()
    const { swapRecords } = useSwapRecordsSelector()
    const { modalNavigate } = useModalNavigate()

    const { handleScroll, ref: scrollRef } = useInfiniteScroll<HTMLDivElement>(fetchNextPage)

    const columns = useMemo(
      () => [
        ...(!showSimplified
          ? [
              columnHelper.accessor(row => row.account.blockchain, {
                cell: info => <BlockchainIcon blockchain={info.getValue()} />,
                id: 'blockchain',
                header: undefined,
              }),
            ]
          : []),
        columnHelper.accessor('time', {
          cell: info => format(info.getValue() * 1000, 'MM/dd/yyyy HH:mm:ss'),
          header: t('components:transactionsTable.date'),
        }),
        columnHelper.accessor('asset', {
          cell: info => info.getValue(),
          header: t('components:transactionsTable.asset'),
        }),
        columnHelper.accessor('amount', {
          cell: info => info.getValue(),
          header: t('components:transactionsTable.amount'),
        }),
        ...(!showSimplified
          ? [
              columnHelper.accessor(row => row.fromAccount?.name ?? row.from, {
                cell: info => StringHelper.truncateStringMiddle(info.getValue(), 15),
                id: 'from',
                header: t('components:transactionsTable.from'),
              }),
            ]
          : []),
        columnHelper.accessor(row => row.toAccount?.name ?? row.to, {
          cell: info => (
            <Button
              className="flex flex-row"
              label={StringHelper.truncateStringMiddle(info.getValue(), 25)}
              rightIcon={<MdContentCopy className="text-neon w-4.5 h-4.5" />}
              variant="text-slim"
              colorSchema="white"
              clickableProps={{ className: 'text-xs' }}
              onClick={event => {
                event.stopPropagation()
                UtilsHelper.copyToClipboard(info.row.original.to ?? '')
              }}
            />
          ),
          id: 'to',
          header: t('components:transactionsTable.to'),
        }),
        columnHelper.display({
          id: 'actions',
          cell: info => {
            const explorerUrl = getExplorerUrl(info.row.original)
            const swapRecord = swapRecords.find(
              swapRecord =>
                swapRecord.txFrom &&
                UtilsHelper.normalizeHash(swapRecord.txFrom) === UtilsHelper.normalizeHash(info.row.original.hash)
            )

            return (
              <div className="flex gap-5 justify-end">
                {swapRecord && (
                  <Button
                    variant="text-slim"
                    label="Swap"
                    colorSchema="blue"
                    leftIcon={<TbTransform />}
                    onClick={event => {
                      event.stopPropagation()
                      modalNavigate('swap-details', { state: { swapRecord } })
                    }}
                  />
                )}
                <TbChevronRight
                  style={{ visibility: explorerUrl ? 'visible' : 'hidden' }}
                  className="w-4 h-4 my-2 text-gray-300"
                />
              </div>
            )
          },
        }),
      ],
      [modalNavigate, showSimplified, swapRecords]
    )

    const allTransfers = useMemo(
      () =>
        pendingTransactions
          .filter(transaction => accounts.some(AccountHelper.predicate(transaction.account)))
          .concat(aggregatedData),
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [accounts, pendingTransactions, aggregatedData, aggregatedData.length]
    )

    const table = useReactTable({
      data: allTransfers,
      columns,
      getCoreRowModel: getCoreRowModel(),
    })

    const getExplorerUrl = (row: TUseTransactionsTransfer) => {
      if (row.isPending) return

      const service = bsAggregator.blockchainServicesByName[row.account.blockchain]

      if (!hasExplorerService(service)) return

      let explorerUrl

      try {
        explorerUrl = service.explorerService.buildTransactionUrl(row.hash)
      } catch (error) {
        console.error(error)
      }

      return explorerUrl
    }

    const openExplorerUrl = (explorerUrl: string) => {
      window.open(explorerUrl)
    }

    useImperativeHandle(ref, () => scrollRef.current!, [scrollRef])

    return (
      <section
        className="overflow-auto min-h-0 w-full flex flex-col flex-grow mt-4 text-xs min-w-0"
        ref={scrollRef}
        onScroll={handleScroll}
      >
        {isLoading ? (
          <Loader containerClassName="mt-4 flex-grow items-center" />
        ) : allTransfers.length <= 0 ? (
          <div className="flex justify-center mt-4">
            <p className="text-gray-300">{t('components:transactionsTable.empty')}</p>
          </div>
        ) : (
          <Table.Root className="table-auto">
            <Table.Header className={tableHeaderClassName}>
              {table.getHeaderGroups().map(headerGroup => (
                <Table.HeaderRow key={headerGroup.id}>
                  {headerGroup.headers.map(header => (
                    <Table.Head key={header.id}>
                      {flexRender(header.column.columnDef.header, header.getContext())}
                    </Table.Head>
                  ))}
                </Table.HeaderRow>
              ))}
            </Table.Header>

            <Table.Body>
              {table.getRowModel().rows.map(row => (
                <Table.BodyRow
                  key={row.id}
                  hoverable={!row.original.isPending}
                  className={StyleHelper.mergeStyles('truncate', { 'animate-pulse': row.original.isPending })}
                >
                  {row.getVisibleCells().map(cell => {
                    const explorerUrl = getExplorerUrl(row.original)

                    return (
                      <Table.Cell
                        className={StyleHelper.mergeStyles('truncate ', {
                          'cursor-pointer': !!explorerUrl && !row.original.isPending,
                          'cursor-not-allowed': row.original.isPending,
                        })}
                        key={cell.id}
                        onClick={explorerUrl ? openExplorerUrl.bind(null, explorerUrl) : undefined}
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </Table.Cell>
                    )
                  })}
                </Table.BodyRow>
              ))}
            </Table.Body>
          </Table.Root>
        )}
      </section>
    )
  }
)
