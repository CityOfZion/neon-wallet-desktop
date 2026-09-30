import {
  type ComponentProps,
  createContext,
  Fragment,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react'

import type { TBSToken } from '@cityofzion/blockchain-service'
import { useVirtualizer } from '@tanstack/react-virtual'
import debounce from 'lodash/debounce'
import { useTranslation } from 'react-i18next'
import { RemoveScroll } from 'react-remove-scroll'

import { TokenItem } from '@renderer/components/TokenItem'

import { LoggerHelper } from '@renderer/helpers/LoggerHelper'
import { StyleHelper } from '@renderer/helpers/StyleHelper'

import MdSearch from '@renderer/assets/images/md-search.svg?react'

import { TBlockchainServiceKey } from '@shared/types/blockchain'

import { Command } from './Command'
import { Loader } from './Loader'
import { Popover } from './Popover'
import { Separator } from './Separator'

type TSearchableTokenContext = {
  blockchain: TBlockchainServiceKey
  value?: TBSToken
  onValueChange?: (value: TBSToken) => void
  onSearch: (value: string) => Promise<TBSToken[]>
  isOpen?: boolean
  onOpenChange: (isOpen: boolean) => void
  isLoading: boolean
  onLoadingChange: (isLoading: boolean) => void
  tokens: TBSToken[]
  onTokensChange: (tokens: TBSToken[]) => void
  filter: string
  onFilterChange: (filter: string) => void
}

const SearchableTokenContext = createContext<TSearchableTokenContext | null>(null)

const useSearchableTokenContext = () => {
  const context = useContext(SearchableTokenContext)
  if (!context) {
    throw new Error(
      'SearchableTokenContext compound components cannot be rendered outside the SearchableTokenContext.Root component'
    )
  }

  return context
}

type TRootProps = ComponentProps<typeof Popover.Root> & {
  blockchain: TBlockchainServiceKey
  value?: TBSToken
  onValueChange?: (value: TBSToken) => void
  onSearch: (value: string) => Promise<TBSToken[]>
}
const Root = ({ blockchain, value, onValueChange, onSearch, onOpenChange, open, ...props }: TRootProps) => {
  const [internalOpen, setInternalOpen] = useState<boolean>(open ?? false)
  const [isLoading, setIsLoading] = useState(false)
  const [tokens, setTokens] = useState<TBSToken[]>([])
  const [filter, setFilter] = useState('')

  const handleOpenChange = (isOpen: boolean) => {
    setInternalOpen(isOpen)
    onOpenChange?.(isOpen)
  }

  const isOpen = open || internalOpen

  return (
    <SearchableTokenContext.Provider
      value={{
        blockchain,
        value,
        onValueChange,
        onSearch,
        isOpen: isOpen,
        onOpenChange: handleOpenChange,
        isLoading,
        onLoadingChange: setIsLoading,
        tokens,
        onTokensChange: setTokens,
        filter,
        onFilterChange: setFilter,
      }}
    >
      <Popover.Root {...props} open={isOpen} onOpenChange={handleOpenChange} />
    </SearchableTokenContext.Provider>
  )
}

const Trigger = ({ className, disabled, ...props }: ComponentProps<typeof Popover.Trigger>) => {
  return (
    <Popover.Trigger
      className={StyleHelper.mergeStyles(
        'bg-asphalt aria-expanded:bg-asphalt flex h-9 w-full items-center gap-2 rounded-sm px-2',
        'aria-[disabled=false]:hover:bg-asphalt/60 aria-[disabled=false]:focus:bg-asphalt/60 aria-[disabled=false]:active:bg-asphalt/40',
        'aria-disabled:cursor-not-allowed aria-disabled:opacity-50',
        className
      )}
      aria-disabled={disabled}
      disabled={disabled}
      {...props}
    />
  )
}

const Value = () => {
  const { t } = useTranslation('components', { keyPrefix: 'searchableToken' })
  const { blockchain, value } = useSearchableTokenContext()

  if (!value) {
    return (
      <div className="flex w-full items-center justify-between text-white/50">
        <span className="pl-3 text-left text-xs">{t('placeholder')}</span>
        <MdSearch className="size-6" aria-hidden />
      </div>
    )
  }

  return <TokenItem blockchain={blockchain} token={value} />
}

const Content = ({ className, children, ...props }: ComponentProps<typeof Popover.Content>) => {
  return (
    <Popover.Content
      className={StyleHelper.mergeStyles('bg-transparent', className)}
      align="end"
      sideOffset={-34}
      {...props}
    >
      <RemoveScroll>
        <Command.Root shouldFilter={false}>{children}</Command.Root>
      </RemoveScroll>
    </Popover.Content>
  )
}

const Input = (props: ComponentProps<typeof Command.Input>) => {
  const { onSearch, onLoadingChange, onTokensChange, filter, onFilterChange } = useSearchableTokenContext()

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSearchChange = useCallback(
    debounce(async (text: string) => {
      try {
        const tokens = await onSearch?.(text)

        onTokensChange(tokens || [])
      } catch (error) {
        LoggerHelper.error(error, { where: 'SearchableTokenSelect' })
      } finally {
        onLoadingChange(false)
      }
    }, 1500),
    []
  )

  const handleValueChange = (value: string) => {
    onFilterChange(value)
    debouncedSearchChange(value)
    onLoadingChange?.(true)
  }

  return <Command.Input value={filter} onValueChange={handleValueChange} {...props} />
}

type TListProps = ComponentProps<typeof Command.List>
const List = ({ className, ...props }: TListProps) => {
  const { t } = useTranslation('components', { keyPrefix: 'searchableToken' })
  const { blockchain, isOpen, isLoading, tokens, filter, onValueChange, onOpenChange } = useSearchableTokenContext()

  const parentRef = useRef<HTMLDivElement>(null)

  const rowVirtualizer = useVirtualizer({
    count: tokens.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 40,
  })

  const handleTokenSelect = (token: TBSToken) => {
    onValueChange?.(token)
    onOpenChange(false)
  }

  useEffect(() => {
    setTimeout(() => {
      rowVirtualizer._willUpdate()
    }, 0)
  }, [isOpen, tokens.length, rowVirtualizer])

  return (
    <Command.List ref={parentRef} className={StyleHelper.mergeStyles('max-h-44', className)} {...props}>
      {isLoading ? (
        <Loader containerClassName="py-4" />
      ) : (
        <Fragment>
          <Command.Empty>{filter.length === 0 ? t('emptyMessage') : t('notFoundMessage')}</Command.Empty>

          <Command.Group
            style={{
              height: `${rowVirtualizer.getTotalSize()}px`,
              width: '100%',
              position: 'relative',
            }}
          >
            {rowVirtualizer.getVirtualItems().map(virtualItem => {
              const row = tokens[virtualItem.index]
              const value = `${row.symbol}-${row.hash}-${virtualItem.key}`

              return (
                <Command.Item
                  key={virtualItem.key}
                  value={value}
                  className="group absolute top-0 left-0 h-10 w-full cursor-pointer flex-col items-start px-2 data-[selected='true']:bg-gray-800/60"
                  style={{ height: `${virtualItem.size}px`, transform: `translateY(${virtualItem.start}px)` }}
                  onSelect={handleTokenSelect.bind(null, row)}
                >
                  <TokenItem blockchain={blockchain} token={row} />

                  <Separator className="group-last:hidden" />
                </Command.Item>
              )
            })}
          </Command.Group>
        </Fragment>
      )}
    </Command.List>
  )
}

export const SearchableTokenSelect = {
  Root,
  Trigger,
  Value,
  Content,
  Input,
  List,
}
