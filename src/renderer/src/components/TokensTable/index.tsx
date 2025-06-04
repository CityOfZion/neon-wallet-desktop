import { forwardRef } from 'react'
import { StyleHelper } from '@renderer/helpers/StyleHelper'
import { TUseBalanceOptionShowType } from '@shared/@types/query'
import { IAccountState } from '@shared/@types/store'
import { getI18next } from '@shared/libs/i18next'
import { flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table'
import { match, P } from 'ts-pattern'

import { Loader } from '../Loader'
import { Table } from '../Table'

import { useColumns } from './columns'
import { useData } from './data'

type TProps = {
  accounts: IAccountState[]
  className?: string
  containerClassName?: string
  showType?: TUseBalanceOptionShowType
}

const { t } = getI18next()

export const TokensTable = forwardRef<HTMLDivElement, TProps>(
  ({ accounts, className, containerClassName, showType = 'active' }, ref) => {
    const columns = useColumns(showType)
    const { data, isLoading } = useData(accounts, showType)

    const table = useReactTable({
      data,
      columns,
      getCoreRowModel: getCoreRowModel(),
    })

    return (
      <section
        className={StyleHelper.mergeStyles(
          'mt-4 flex min-h-0 w-full min-w-0 flex-grow flex-col overflow-auto',
          containerClassName
        )}
        ref={ref}
      >
        {match({ isLoading, data })
          .with({ isLoading: true }, () => <Loader containerClassName="mt-4 flex-grow items-center" />)
          .with({ data: P.when(it => it.length === 0) }, () => (
            <div className="mt-4 flex justify-center">
              <p className="text-gray-300">{t('components:tokensTable.empty')}</p>
            </div>
          ))
          .otherwise(() => (
            <Table.Root className={StyleHelper.mergeStyles('table-fixed', className)}>
              <Table.Header className="sticky top-0 bg-gray-800">
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
                  <Table.BodyRow key={row.id}>
                    {row.getVisibleCells().map(cell => (
                      <Table.Cell className="truncate" key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </Table.Cell>
                    ))}
                  </Table.BodyRow>
                ))}
              </Table.Body>
            </Table.Root>
          ))}
      </section>
    )
  }
)
