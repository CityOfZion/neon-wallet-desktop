import { forwardRef, useImperativeHandle, useMemo, useRef, useState } from 'react'
import { Balance, TokenBalance, UseMultipleBalanceAndExchangeResult } from '@renderer/@types/query'
import { BlockchainIcon } from '@renderer/components/BlockchainIcon'
import { BalanceHelper } from '@renderer/helpers/BalanceHelper'
import { NumberHelper } from '@renderer/helpers/NumberHelper'
import { StyleHelper } from '@renderer/helpers/StyleHelper'
import { useCurrencySelector } from '@renderer/hooks/useSettingsSelector'
import { getI18next } from '@renderer/libs/i18next'
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from '@tanstack/react-table'

import { Loader } from './Loader'
import { Table } from './Table'

type TProps = {
  balanceExchange: UseMultipleBalanceAndExchangeResult
  showSimplified?: boolean
  className?: string
  containerClassName?: string
  onTokenSelected?: (token: TokenBalance) => void
  selectedToken?: TokenBalance
}

type TTokenBalanceWithExchange = TokenBalance & {
  exchangeRatio: number
  convertedAmount: number
}

const { t } = getI18next()

const columnHelper = createColumnHelper<TTokenBalanceWithExchange>()

export const TokensTable = forwardRef<HTMLDivElement, TProps>(
  ({ balanceExchange, showSimplified, className, onTokenSelected, selectedToken, containerClassName }, ref) => {
    const { currency } = useCurrencySelector()

    const filteredTokenBalance = useMemo(() => {
      const groupedTokens = new Map<string, TTokenBalanceWithExchange>()

      balanceExchange.balance.data.forEach((balance: Balance) => {
        balance.tokensBalances.forEach((token: TokenBalance) => {
          if (token.amountNumber <= 0) return

          const groupedToken = groupedTokens.get(token.token.hash)
          if (!groupedToken) {
            groupedTokens.set(token.token.hash, {
              ...token,
              exchangeRatio: BalanceHelper.getExchangeRatio(
                token.token.hash,
                token.blockchain,
                balanceExchange.exchange.data
              ),
              convertedAmount:
                BalanceHelper.convertBalanceToCurrency(token, balanceExchange.exchange.data)?.convertedAmount ?? 0,
            })
            return
          }

          groupedToken.amountNumber += token.amountNumber
          groupedToken.amount = token.amountNumber.toFixed(token.token.decimals)
          groupedToken.convertedAmount =
            BalanceHelper.convertBalanceToCurrency(token, balanceExchange.exchange.data)?.convertedAmount ?? 0
        })
      })

      return Array.from(groupedTokens.values())
    }, [balanceExchange.balance.data, balanceExchange.exchange.data])

    const [sorting, setSorting] = useState<SortingState>([])
    const scrollRef = useRef<HTMLDivElement>(null)

    const columns = useMemo(
      () =>
        !showSimplified
          ? [
              columnHelper.accessor('token.symbol', {
                cell: info => {
                  return (
                    <div className="flex gap-2">
                      <div className="rounded-lg bg-gray-300 w-4.5 h-4.5 flex justify-center items-center">
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
              columnHelper.accessor('convertedAmount', {
                cell: info => NumberHelper.currency(info.getValue(), currency.label),
                header: t('components:tokensTable.value'),
              }),
            ]
          : [
              columnHelper.accessor('token.symbol', {
                cell: info => {
                  return (
                    <div className="flex gap-2">
                      <div className="rounded-lg bg-gray-300 w-4.5 h-4.5 flex justify-center items-center">
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
              columnHelper.accessor(row => Number(row.amount).toFixed(row.token?.decimals ?? 8), {
                cell: info => info.getValue(),
                id: 'holdings',
                header: t('components:tokensTable.holdings'),
              }),
              columnHelper.accessor('exchangeRatio', {
                cell: info => NumberHelper.currency(info.getValue(), currency.label),
                header: t('components:tokensTable.price'),
              }),
            ],
      [currency.label, showSimplified]
    )

    const table = useReactTable({
      data: filteredTokenBalance,
      columns,
      state: {
        sorting,
      },
      getCoreRowModel: getCoreRowModel(),
      getSortedRowModel: getSortedRowModel(),
      onSortingChange: newSorting => {
        setSorting(newSorting)
        scrollRef.current?.scrollTo(0, 0)
      },
    })

    useImperativeHandle(ref, () => scrollRef.current!, [scrollRef])

    return (
      <section
        className={StyleHelper.mergeStyles(
          'overflow-auto flex flex-col min-h-0 w-full flex-grow mt-4 min-w-0 ',
          containerClassName
        )}
        ref={scrollRef}
      >
        {balanceExchange.isLoading ? (
          <Loader containerClassName="mt-4 flex-grow items-center" />
        ) : filteredTokenBalance.length <= 0 ? (
          <div className="flex justify-center mt-4">
            <p className="text-gray-300">{t('components:tokensTable.empty')}</p>
          </div>
        ) : (
          <Table.Root className={StyleHelper.mergeStyles('table-fixed', className)}>
            <Table.Header className="sticky top-0 bg-gray-800">
              {table.getHeaderGroups().map(headerGroup => (
                <Table.HeaderRow key={headerGroup.id}>
                  {headerGroup.headers.map(header => (
                    <Table.Head
                      key={header.id}
                      sortable={header.column.getCanSort()}
                      sortedBy={header.column.getIsSorted()}
                      onClick={header.column.getToggleSortingHandler()}
                    >
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
