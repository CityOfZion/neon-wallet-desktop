import { forwardRef, useImperativeHandle, useMemo } from 'react'
import { MdContentCopy } from 'react-icons/md'
import { TbChevronRight } from 'react-icons/tb'
import { TUseTransactionsTransfer } from '@renderer/@types/hooks'
import { IAccountState } from '@renderer/@types/store'
import { ExplorerHelper } from '@renderer/helpers/ExplorerHelper'
import { StringHelper } from '@renderer/helpers/StringHelper'
import { StyleHelper } from '@renderer/helpers/StyleHelper'
import { ToastHelper } from '@renderer/helpers/ToastHelper'
import { UtilsHelper } from '@renderer/helpers/UtilsHelper'
import { useInfiniteScroll } from '@renderer/hooks/useInfiniteScroll'
import { useAppSelector } from '@renderer/hooks/useRedux'
import { useNetworkTypeSelector } from '@renderer/hooks/useSettingsSelector'
import { useTransactions } from '@renderer/hooks/useTransactions'
import { getI18next } from '@renderer/libs/i18next'
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
    const { transfers, fetchNextPage, isLoading } = useTransactions({ accounts })
    const { value: pendingTransactions } = useAppSelector(state => state.account.pendingTransactions)

    const { networkType } = useNetworkTypeSelector()
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
        columnHelper.accessor('token.name', {
          cell: info => info.getValue(),
          header: t('components:transactionsTable.asset'),
        }),
        columnHelper.accessor('amount', {
          cell: info => Number(info.getValue()).toFixed(info.row.original.token?.decimals ?? 8),
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
              onClick={() => UtilsHelper.copyToClipboard(info.row.original.to ?? '')}
            />
          ),
          id: 'to',
          header: t('components:transactionsTable.to'),
        }),
        columnHelper.display({
          id: 'actions',
          cell: () => <TbChevronRight className="w-4 h-4 my-2 text-gray-300" />,
        }),
      ],
      [showSimplified]
    )

    const allTransfers = useMemo(
      () =>
        pendingTransactions
          .filter(transaction => accounts.some(account => account.address === transaction.account.address))
          .concat(transfers),
      [accounts, pendingTransactions, transfers]
    )

    const table = useReactTable({
      data: allTransfers,
      columns,
      getCoreRowModel: getCoreRowModel(),
    })

    const handleClick = (row: TUseTransactionsTransfer) => {
      if (row.isPending) return

      try {
        const url = ExplorerHelper.buildTransactionUrl(row.hash, networkType, row.account.blockchain)
        window.open(url)
      } catch (error) {
        ToastHelper.error({ message: t('components:transactionsTable.doraError') })
      }
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
                  {row.getVisibleCells().map(cell => (
                    <Table.Cell
                      className={StyleHelper.mergeStyles('truncate', {
                        'cursor-pointer': cell.column.id !== 'to',
                        'cursor-not-allowed': row.original.isPending,
                      })}
                      key={cell.id}
                      onClick={cell.column.id !== 'to' ? handleClick.bind(null, row.original) : undefined}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </Table.Cell>
                  ))}
                </Table.BodyRow>
              ))}
            </Table.Body>
          </Table.Root>
        )}
      </section>
    )
  }
)
