import { forwardRef, useImperativeHandle } from 'react'
import { useTranslation } from 'react-i18next'
import { StyleHelper } from '@renderer/helpers/StyleHelper'
import { useInfiniteScroll } from '@renderer/hooks/useInfiniteScroll'
import { TUseTransactionsTransfer } from '@shared/@types/hooks'
import { IAccountState } from '@shared/@types/store'
import { flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table'
import { match } from 'ts-pattern'

import { Loader } from '../Loader'
import { Table } from '../Table'

import { useColumns } from './columns'
import { useData } from './data'

type TTransactionListProps = {
  accounts: IAccountState[]
  showSimplified?: boolean
  tableHeaderClassName?: string
}

export const TransactionsTable = forwardRef<HTMLDivElement, TTransactionListProps>(
  ({ accounts, showSimplified = false, tableHeaderClassName }, ref) => {
    const { t } = useTranslation('components', { keyPrefix: 'transactionsTable' })
    const columns = useColumns(showSimplified)
    const { allTransfers, fetchNextPage, isLoading } = useData(accounts)

    const { handleScroll, ref: scrollRef } = useInfiniteScroll<HTMLDivElement>(fetchNextPage)

    const table = useReactTable({
      data: allTransfers,
      columns,
      getCoreRowModel: getCoreRowModel(),
    })

    const handleOpenExplorer = (row: TUseTransactionsTransfer) => {
      window.open(row.explorerUrl)
    }

    useImperativeHandle(ref, () => scrollRef.current!, [scrollRef])

    return (
      <section
        className="overflow-auto min-h-0 w-full flex flex-col flex-grow mt-4 text-xs min-w-0"
        ref={scrollRef}
        onScroll={handleScroll}
      >
        {match({ isLoading, allTransfers })
          .with({ isLoading: true }, () => <Loader containerClassName="mt-4 flex-grow items-center" />)
          .with({ allTransfers: [] }, () => (
            <div className="flex justify-center mt-4">
              <p className="text-gray-300">{t('empty')}</p>
            </div>
          ))
          .otherwise(() => (
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
                      const isDisabled = row.original.isPending || !row.original.explorerUrl
                      return (
                        <Table.Cell
                          className={StyleHelper.mergeStyles('truncate cursor-pointer', {
                            'pointer-events-none': isDisabled,
                          })}
                          key={cell.id}
                          onClick={!isDisabled ? handleOpenExplorer.bind(null, row.original) : undefined}
                        >
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </Table.Cell>
                      )
                    })}
                  </Table.BodyRow>
                ))}
              </Table.Body>
            </Table.Root>
          ))}
      </section>
    )
  }
)
