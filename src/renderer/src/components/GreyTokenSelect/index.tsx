import { useEffect, useMemo, useRef, useState } from 'react'

import { useVirtualizer } from '@tanstack/react-virtual'
import { useTranslation } from 'react-i18next'
import { RemoveScroll } from 'react-remove-scroll'
import { match } from 'ts-pattern'

import { Loader } from '@renderer/components/Loader'
import { Popover } from '@renderer/components/Popover'
import { Separator } from '@renderer/components/Separator'

import { NumberHelper } from '@renderer/helpers/NumberHelper'
import { StyleHelper } from '@renderer/helpers/StyleHelper'

import { bsAggregator } from '@renderer/libs/blockchain-service'
import { TBlockchainServiceKey } from '@shared/@types/blockchain'
import { TBalance } from '@shared/@types/query'

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
  triggerClassName?: string
}

export const GreyTokenSelect = <T extends TGreyTokenSelectToken>({
  tokens,
  loading = false,
  selectedToken,
  onSelect,
  balance,
  disabled = false,
  blockchain,
  triggerClassName,
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
      const service = bsAggregator.blockchainServicesByName[balance.blockchain]

      filtered = filtered.map(token => {
        const tokenBalance = balance.tokensBalances.find(tokenBalance =>
          service.tokenService.predicateByHash(token.hash!, tokenBalance.token)
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
          'bg-asphalt aria-expanded:bg-asphalt flex h-8.5 w-32 min-w-3 items-center gap-2 rounded-sm px-2',
          {
            'aria-[disabled=false]:hover:bg-asphalt/60': !selectedToken && !isDisabled,
            'bg-gray-300/15 aria-[disabled=false]:hover:bg-gray-300/30': selectedToken,
            'opacity-50': isDisabled,
          },
          triggerClassName
        )}
      >
        {match({ loading, isTokenSelected: !!selectedToken })
          .with({ loading: true }, () => <Loader />)
          .with({ isTokenSelected: true }, () => <GreyTokenSelectItem token={selectedToken!} />)
          .otherwise(() => (
            <span className="text-neon w-full text-center text-sm font-medium">{t('placeholder')}</span>
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
                      className="absolute top-0 left-0 h-10 w-full flex-col"
                      style={{
                        height: `${virtualItem.size}px`,
                        transform: `translateY(${virtualItem.start}px)`,
                      }}
                    >
                      <div className="flex h-full w-full items-center gap-2">
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
