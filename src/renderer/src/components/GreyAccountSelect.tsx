import { type JSX, useEffect, useMemo, useRef, useState } from 'react'

import { useVirtualizer } from '@tanstack/react-virtual'
import { useTranslation } from 'react-i18next'
import { RemoveScroll } from 'react-remove-scroll'
import { match } from 'ts-pattern'

import { Loader } from '@renderer/components/Loader'
import { Popover, TPopoverContentProps } from '@renderer/components/Popover'
import { Separator } from '@renderer/components/Separator'

import { StringHelper } from '@renderer/helpers/StringHelper'
import { StyleHelper } from '@renderer/helpers/StyleHelper'

import { useAccountsWithWalletSelector } from '@renderer/hooks/useAccountSelector'

import { TBlockchainServiceKey } from '@shared/types/blockchain'
import { TAccount, TAccountType, TAccountWithWallet } from '@shared/types/store'

import { BlockchainIcon } from './BlockchainIcon'
import { Command } from './Command'
import { Tooltip } from './Tooltip'

type TPlacement = 'overlap' | 'dropdownEnd' | 'dropdownStart'

type TProps<T extends TBlockchainServiceKey> = {
  selectedAccount?: TAccount<T> | null
  onSelect: (account: TAccount<T>) => void
  children?: JSX.Element
  blockchains?: T[]
  disabled?: boolean
  loading?: boolean
  triggerClassName?: string
  accountTypes?: TAccountType[]
  placement?: TPlacement
}

const placementProps: Record<TPlacement, Pick<TPopoverContentProps, 'align' | 'sideOffset'>> = {
  overlap: { align: 'end', sideOffset: -34 },
  dropdownEnd: { align: 'end', sideOffset: 8 },
  dropdownStart: { align: 'start', sideOffset: 8 },
}

export const GreyAccountSelect = <T extends TBlockchainServiceKey>({
  onSelect,
  selectedAccount,
  blockchains,
  children,
  disabled = false,
  loading,
  triggerClassName,
  accountTypes = ['standard', 'hardware'],
  placement = 'overlap',
}: TProps<T>) => {
  const { accountsWithWallet } = useAccountsWithWalletSelector()
  const { t } = useTranslation('components', { keyPrefix: 'greyAccountSelect' })

  const [filter, setFilter] = useState('')
  const [open, setOpen] = useState(false)

  const ref = useRef<HTMLDivElement>(null)

  const filteredAccounts = useMemo(() => {
    let filtered = accountsWithWallet.filter(account => (accountTypes ? accountTypes.includes(account.type) : true))

    if (blockchains) {
      filtered = filtered.filter(account => blockchains.includes(account.blockchain as T))
    }

    return filtered
  }, [accountsWithWallet, blockchains, accountTypes])

  const isDisabled = loading || disabled || filteredAccounts.length === 0

  const filteredAccountsByText = useMemo(() => {
    const newFilter = filter.toLowerCase().trim()
    if (!newFilter) return filteredAccounts

    return filteredAccounts.filter(
      account =>
        account.name.toLowerCase().includes(newFilter) ||
        account.address.toLowerCase().includes(newFilter) ||
        account.blockchain.toLowerCase().includes(newFilter) ||
        account.wallet.name.toLowerCase().includes(newFilter)
    )
  }, [filter, filteredAccounts])

  const rowVirtualizer = useVirtualizer({
    count: filteredAccountsByText.length,
    getScrollElement: () => ref.current,
    estimateSize: () => 50,
  })

  const handleAccountSelection = (account: TAccountWithWallet) => {
    onSelect(account as unknown as TAccount<T>)
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
      {children ? (
        <Popover.Trigger asChild disabled={isDisabled}>
          {children}
        </Popover.Trigger>
      ) : (
        <Popover.Trigger
          disabled={isDisabled}
          aria-disabled={isDisabled}
          className={StyleHelper.mergeStyles(
            'bg-asphalt aria-expanded:bg-asphalt flex h-8.5 max-w-36 min-w-36 items-center gap-2.5 rounded-sm px-2',
            {
              'aria-[disabled=false]:hover:bg-asphalt/60': !selectedAccount && !isDisabled,
              'max-w-32 min-w-32 bg-gray-300/15 aria-[disabled=false]:hover:bg-gray-300/30': selectedAccount,
              'opacity-50': isDisabled,
            },
            triggerClassName
          )}
        >
          {match({ loading: loading ?? false, isSelectedAccount: !!selectedAccount })
            .with({ loading: true }, () => <Loader />)
            .with({ isSelectedAccount: true }, () => (
              <div className="flex min-w-0 items-center gap-2.5">
                <BlockchainIcon blockchain={selectedAccount!.blockchain} className="text-gray-100" />

                <Tooltip title={selectedAccount!.address}>
                  <span className="text-start text-sm text-white">
                    {StringHelper.truncateStringMiddle(selectedAccount!.address, 8)}
                  </span>
                </Tooltip>
              </div>
            ))
            .otherwise(() => (
              <span className="text-neon w-full text-center font-medium">{t('placeholder')}</span>
            ))}
        </Popover.Trigger>
      )}

      <Popover.Content className="relative max-w-48 bg-transparent" {...placementProps[placement]}>
        <RemoveScroll>
          <Command.Root shouldFilter={false}>
            <Command.Input value={filter} onValueChange={setFilter} />

            <Command.List ref={ref} className="max-h-44">
              <Command.Empty>{t('empty')}</Command.Empty>

              <Command.Group
                style={{
                  height: `${rowVirtualizer.getTotalSize()}px`,
                  width: '100%',
                  position: 'relative',
                }}
              >
                {rowVirtualizer.getVirtualItems().map(virtualItem => {
                  const account = filteredAccountsByText[virtualItem.index]
                  const value = `${account.id}-${virtualItem.key}`

                  return (
                    <Command.Item
                      key={virtualItem.key}
                      value={value}
                      onSelect={() => handleAccountSelection(account)}
                      className="group/item absolute top-0 left-0 h-12.5 max-h-12.5 min-h-12.5 w-full cursor-pointer flex-col"
                      style={{
                        height: `${virtualItem.size}px`,
                        transform: `translateY(${virtualItem.start}px)`,
                      }}
                    >
                      <div className="flex size-full items-center gap-3 px-2">
                        <BlockchainIcon className="size-4 text-gray-100" blockchain={account.blockchain} />

                        <div className="flex min-w-0 grow flex-col gap-0.5">
                          <Tooltip title={account.address}>
                            <span className="text-sm text-white">
                              {StringHelper.truncateStringMiddle(account.address, 8)}
                            </span>
                          </Tooltip>

                          <span className="text-1xs truncate text-left text-gray-100">
                            {account.name} | {account.wallet.name}
                          </span>
                        </div>
                      </div>

                      <Separator className="group-last/item:hidden" />
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
