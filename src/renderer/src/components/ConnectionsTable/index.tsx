import { forwardRef } from 'react'

import { flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table'
import { useTranslation } from 'react-i18next'
import { match, P } from 'ts-pattern'

import { Table } from '@renderer/components/Table'

import { StyleHelper } from '@renderer/helpers/StyleHelper'

import type { TUseWalletConnectSessionsResult } from '@shared/types/query'

import { useColumns } from './columns'

type TConnectionsTableProps = {
  sessions: TUseWalletConnectSessionsResult[]
  withAddress?: boolean
  tableHeaderClassName?: string
  className?: string
}

export const ConnectionsTable = forwardRef<HTMLDivElement, TConnectionsTableProps>(
  ({ sessions, tableHeaderClassName, withAddress = false, className }, ref) => {
    const { t } = useTranslation('components', { keyPrefix: 'connectionsTable' })

    const columns = useColumns(withAddress)

    const table = useReactTable({
      data: sessions,
      columns,
      getCoreRowModel: getCoreRowModel(),
    })

    return (
      <div
        ref={ref}
        className={StyleHelper.mergeStyles(
          'flex min-h-0 w-full min-w-0 grow flex-col overflow-auto pr-1 text-xs',
          className
        )}
      >
        {match({ sessions })
          .with({ sessions: P.when(it => it.length === 0) }, () => (
            <div className="mt-4 flex justify-center">
              <p className="text-gray-300">{t('emptyList')}</p>
            </div>
          ))
          .otherwise(() => (
            <Table.Root className="table-fixed">
              <Table.Header className={StyleHelper.mergeStyles('sticky top-0 uppercase', tableHeaderClassName)}>
                {table.getHeaderGroups().map(headerGroup => (
                  <Table.HeaderRow key={headerGroup.id}>
                    {headerGroup.headers.map(header => (
                      <Table.Head key={header.id} className={header.column.columnDef?.meta?.['className']}>
                        {flexRender(header.column.columnDef.header, header.getContext())}
                      </Table.Head>
                    ))}
                  </Table.HeaderRow>
                ))}
              </Table.Header>

              <Table.Body>
                {table.getRowModel().rows.map(row => (
                  <Table.BodyRow key={row.id} hoverable={false}>
                    {row.getVisibleCells().map(cell => (
                      <Table.Cell className={cell.column.columnDef?.meta?.['className']} key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </Table.Cell>
                    ))}
                  </Table.BodyRow>
                ))}
              </Table.Body>
            </Table.Root>
          ))}
      </div>
    )
  }
)
