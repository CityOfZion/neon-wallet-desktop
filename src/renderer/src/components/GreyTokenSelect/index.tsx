import { useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { RemoveScroll } from 'react-remove-scroll'
import { Loader } from '@renderer/components/Loader'
import { Popover } from '@renderer/components/Popover'
import { Separator } from '@renderer/components/Separator'
import { NumberHelper } from '@renderer/helpers/NumberHelper'
import { StyleHelper } from '@renderer/helpers/StyleHelper'
import { UtilsHelper } from '@renderer/helpers/UtilsHelper'
import { TBlockchainServiceKey } from '@shared/@types/blockchain'
import { TBalance } from '@shared/@types/query'
import { useVirtualizer } from '@tanstack/react-virtual'
import { match } from 'ts-pattern'

import { Command } from '../Command'

import { GreyTokenSelectItem } from './GreyTokenSelectItem'

export type TGreyTokenSelectToken = {
  symbol: string
  imageUrl?: string
  hash?: string
  network?: string
  blockchain?: TBlockchainServiceKey
  amount?: string
}

type TProps<T extends TGreyTokenSelectToken> = {
  tokens: T[]
  selectedToken?: T
  onSelect?: (token: T) => void
  loading?: boolean
  balance?: TBalance
  disabled?: boolean
  blockchain?: TBlockchainServiceKey
}

export const GreyTokenSelect = <T extends TGreyTokenSelectToken>({
  tokens,
  loading = false,
  selectedToken,
  onSelect,
  balance,
  disabled = false,
  blockchain,
}: TProps<T>) => {
  const [filter, setFilter] = useState('')
  const [open, setOpen] = useState(false)
  const { t } = useTranslation('components', { keyPrefix: 'greyTokenSelect' })

  const parentRef = useRef<HTMLDivElement>(null)

  const isDisabled = loading || disabled

  const filteredAndSortedTokens = useMemo(() => {
    let filtered = [...tokens]

    if (blockchain) {
      filtered = filtered.filter(token => token.blockchain === blockchain)
    }

    if (balance) {
      filtered = filtered.map(token => {
        const tokenHash = UtilsHelper.normalizeHash(token.hash!)
        const tokenBalance = balance.tokensBalances.find(
          tokenBalance => UtilsHelper.normalizeHash(tokenBalance.token.hash) === tokenHash
        )

        return {
          ...token,
          amount: tokenBalance?.amount,
        }
      })
    }

    filtered = filtered.sort((a, b) => NumberHelper.number(a.amount ?? 0) - NumberHelper.number(b.amount ?? 0))

    return filtered
  }, [tokens, balance, blockchain])

  const filteredTokensByText = useMemo(() => {
    let filtered = [...filteredAndSortedTokens]
    const newFilter = filter.toLowerCase().trim()

    if (newFilter)
      filtered = filteredAndSortedTokens.filter(token => token.symbol.toLowerCase().trim().includes(newFilter))

    return filtered
  }, [filter, filteredAndSortedTokens])

  const rowVirtualizer = useVirtualizer({
    count: filteredTokensByText.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 40,
  })

  const handleClickToken = (token: T) => {
    onSelect?.(token)
    setOpen(false)
  }

  useEffect(() => {
    if (!open) {
      setFilter('')
      return
    }

    // It is necessary to wait the popover to be opened to measure the height of the parent element
    setTimeout(() => {
      rowVirtualizer._willUpdate()
    }, 0)
  }, [open, rowVirtualizer])

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger
        disabled={isDisabled}
        aria-disabled={isDisabled}
        className={StyleHelper.mergeStyles(
          'min-w-3 w-32 h-8.5 rounded bg-asphalt aria-expanded:bg-asphalt flex gap-2 items-center px-2',
          {
            'aria-[disabled=false]:hover:bg-asphalt/60': !selectedToken && !isDisabled,
            'aria-[disabled=false]:hover:bg-gray-300/30 bg-gray-300/15': !isDisabled && selectedToken,
            'opacity-50': isDisabled,
          }
        )}
      >
        {match({ loading, isTokenSelected: !!selectedToken })
          .with({ loading: true }, () => <Loader />)
          .with({ isTokenSelected: true }, () => <GreyTokenSelectItem token={selectedToken!} />)
          .otherwise(() => (
            <span className="text-center text-neon font-medium w-full">{t('placeholder')}</span>
          ))}
      </Popover.Trigger>

      <Popover.Content className="max-w-48 bg-transparent" align="end" sideOffset={-34}>
        <RemoveScroll>
          <Command.Root shouldFilter={false}>
            <Command.Input value={filter} onValueChange={setFilter} />

            <Command.List ref={parentRef} className="max-h-60">
              <Command.Empty>{t('empty')}</Command.Empty>

              <Command.Group
                style={{
                  height: `${rowVirtualizer.getTotalSize()}px`,
                  width: '100%',
                  position: 'relative',
                }}
              >
                {rowVirtualizer.getVirtualItems().map((virtualItem, _, array) => {
                  const row = filteredTokensByText[virtualItem.index]
                  const value = `${row.symbol}-${row.network}-${virtualItem.key}`

                  return (
                    <Command.Item
                      key={virtualItem.key}
                      value={value}
                      onSelect={() => handleClickToken(row)}
                      className="flex-col absolute top-0 left-0 w-full h-10"
                      style={{
                        height: `${virtualItem.size}px`,
                        transform: `translateY(${virtualItem.start}px)`,
                      }}
                    >
                      <div className="w-full h-full flex gap-2 items-center">
                        <GreyTokenSelectItem token={row} />
                      </div>

                      {virtualItem.index + 1 !== array.length && <Separator />}
                    </Command.Item>
                  )
                })}
              </Command.Group>
            </Command.List>
          </Command.Root>
        </RemoveScroll>
      </Popover.Content>
    </Popover.Root>
  )
}
