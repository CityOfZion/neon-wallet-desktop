import { forwardRef, useMemo } from 'react'
import { BlockchainIcon } from '@renderer/components/BlockchainIcon'
import { NumberHelper } from '@renderer/helpers/NumberHelper'
import { StringHelper } from '@renderer/helpers/StringHelper'
import { StyleHelper } from '@renderer/helpers/StyleHelper'
import { useCurrencySelector } from '@renderer/hooks/useSettingsSelector'
import { getI18next } from '@renderer/libs/i18next'
import { TTokenBalance, TUseBalancesResult } from '@shared/@types/query'
import { createColumnHelper, flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table'

import { Loader } from './Loader'
import { Table } from './Table'
import { Tooltip } from './Tooltip'

type TProps = {
  balances: TUseBalancesResult
  showSimplified?: boolean
  className?: string
  containerClassName?: string
  onTokenSelected?: (token: TTokenBalance) => void
  selectedToken?: TTokenBalance
}

const { t } = getI18next()

const columnHelper = createColumnHelper<TTokenBalance>()

export const TokensTable = forwardRef<HTMLDivElement, TProps>(
  ({ balances, showSimplified, className, onTokenSelected, selectedToken, containerClassName }, ref) => {
    const { currency } = useCurrencySelector()

    const groupedTokenBalances = useMemo(() => {
      const groupedTokens = new Map<string, TTokenBalance>()

      balances.data.forEach(balance =>
        balance.tokensBalances.forEach(tokenBalance => {
          if (tokenBalance.amountNumber <= 0) return

          const groupedToken = groupedTokens.get(tokenBalance.token.hash)
          if (!groupedToken) {
            groupedTokens.set(tokenBalance.token.hash, tokenBalance)
            return
          }

          groupedToken.amountNumber += tokenBalance.amountNumber
          groupedToken.amount = NumberHelper.removeLeadingZero(
            groupedToken.amountNumber.toFixed(tokenBalance.token.decimals)
          )
          groupedToken.exchangeAmount += tokenBalance.exchangeAmount
        })
      )

      return Array.from(groupedTokens.values())
    }, [balances])

    const columns = useMemo(
      () =>
        !showSimplified
          ? [
              columnHelper.accessor('token.symbol', {
                cell: info => {
                  return (
                    <div className="flex gap-2">
                      <div className="rounded-full bg-gray-300 min-w-[1.125rem] w-4.5 h-4.5 flex justify-center items-center">
                        <BlockchainIcon
                          blockchain={info.row.original.blockchain}
                          type="white"
                          className="w-2.5 h-2.5"
                        />
                      </div>
                      <span>{info.getValue()}</span>
                    </div>
                  )
                },
                header: t('components:tokensTable.ticker'),
              }),
              columnHelper.accessor('token.hash', {
                cell: info => {
                  return (
                    <Tooltip title={info.getValue()}>
                      <span>{StringHelper.truncateStringMiddle(info.getValue(), 12)}</span>
                    </Tooltip>
                  )
                },
                header: t('components:tokensTable.hash'),
              }),
              columnHelper.accessor('token.name', {
                cell: info => info.getValue(),
                header: t('components:tokensTable.token'),
              }),
              columnHelper.accessor(row => Number(row.amount).toFixed(row.token?.decimals ?? 8), {
                cell: info => info.getValue(),
                id: 'holdings',
                header: t('components:tokensTable.holdings'),
              }),
              columnHelper.accessor('exchangeRatio', {
                cell: info => NumberHelper.currency(info.getValue(), currency.label),
                header: t('components:tokensTable.price'),
              }),
              columnHelper.accessor('exchangeAmount', {
                cell: info => NumberHelper.currency(info.getValue(), currency.label),
                header: t('components:tokensTable.value'),
              }),
            ]
          : [
              columnHelper.accessor('token.symbol', {
                cell: info => {
                  return (
                    <div className="flex gap-2">
                      <div className="rounded-lg bg-gray-300 w-4.5 h-4.5 min-w-4.5 flex justify-center items-center">
                        <BlockchainIcon
                          blockchain={info.row.original.blockchain}
                          type="white"
                          className="w-2.5 h-2.5"
                        />
                      </div>
                      <span>{info.getValue()}</span>
                    </div>
                  )
                },
                header: t('components:tokensTable.ticker'),
              }),
              columnHelper.accessor('token.hash', {
                cell: info => {
                  return (
                    <Tooltip title={info.getValue()}>
                      <span>{StringHelper.truncateStringMiddle(info.getValue(), 6)}</span>
                    </Tooltip>
                  )
                },
                header: t('components:tokensTable.hash'),
              }),
              columnHelper.accessor(row => Number(row.amount).toFixed(row.token?.decimals ?? 8), {
                cell: info => {
                  return (
                    <Tooltip title={info.getValue()}>
                      <span>{info.getValue()}</span>
                    </Tooltip>
                  )
                },
                id: 'holdings',
                header: t('components:tokensTable.holdings'),
              }),
              columnHelper.accessor('exchangeRatio', {
                cell: info => {
                  return (
                    <Tooltip title={NumberHelper.currency(info.getValue(), currency.label)}>
                      <span>{NumberHelper.currency(info.getValue(), currency.label)}</span>
                    </Tooltip>
                  )
                },
                header: t('components:tokensTable.price'),
              }),
            ],
      [currency.label, showSimplified]
    )

    const table = useReactTable({
      data: groupedTokenBalances,
      columns,
      getCoreRowModel: getCoreRowModel(),
    })

    return (
      <section
        className={StyleHelper.mergeStyles(
          'overflow-auto flex flex-col min-h-0 w-full flex-grow mt-4 min-w-0 ',
          containerClassName
        )}
        ref={ref}
      >
        {balances.isLoading ? (
          <Loader containerClassName="mt-4 flex-grow items-center" />
        ) : groupedTokenBalances.length <= 0 ? (
          <div className="flex justify-center mt-4">
            <p className="text-gray-300">{t('components:tokensTable.empty')}</p>
          </div>
        ) : (
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
                <Table.BodyRow
                  key={row.id}
                  className="cursor-pointer"
                  onClick={() => onTokenSelected?.(row.original)}
                  active={selectedToken?.token.hash === row.original.token.hash}
                >
                  {row.getVisibleCells().map(cell => (
                    <Table.Cell className="truncate" key={cell.id}>
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
