import { Fragment, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Loader } from '@renderer/components/Loader'
import { StringHelper } from '@renderer/helpers/StringHelper'
import { StyleHelper } from '@renderer/helpers/StyleHelper'
import { useAccountsWithWalletSelector } from '@renderer/hooks/useAccountSelector'
import { TBlockchainServiceKey } from '@shared/@types/blockchain'
import { IAccountState } from '@shared/@types/store'
import { match } from 'ts-pattern'

import { BlockchainIcon } from './BlockchainIcon'
import { Select } from './Select'

type TProps = {
  selectedAccount?: IAccountState | null
  onSelect: (account: IAccountState) => void
  children?: JSX.Element
  blockchains?: TBlockchainServiceKey[]
  disabled?: boolean
  withoutIndicator?: boolean
  loading?: boolean
  placeholder?: string
}

export const GreyAccountSelect = ({
  onSelect,
  selectedAccount,
  blockchains,
  children,
  disabled = false,
  withoutIndicator,
  loading,
}: TProps) => {
  const { accountsWithWallet } = useAccountsWithWalletSelector()
  const { t } = useTranslation('components', { keyPrefix: 'greyAccountSelect' })

  const [open, setOpen] = useState(false)

  const isDisabled = loading || disabled

  const filteredAccounts = useMemo(() => {
    let filtered = accountsWithWallet.filter(account => account.type !== 'watch')

    if (blockchains) {
      filtered = filtered.filter(account => blockchains.includes(account.blockchain))
    }

    return filtered
  }, [blockchains, accountsWithWallet])

  const handleChangeValue = (value: string) => {
    const account = accountsWithWallet.find(account => account.id === value)
    if (!account) return

    onSelect(account)
    setOpen(false)
  }

  return (
    <Select.Root open={open} onOpenChange={setOpen} value={selectedAccount?.id ?? ''} onValueChange={handleChangeValue}>
      {children ? (
        <Select.RawTrigger asChild disabled={isDisabled}>
          {children}
        </Select.RawTrigger>
      ) : (
        <Select.Trigger
          disabled={isDisabled}
          className={StyleHelper.mergeStyles(
            'min-w-36 max-w-36 bg-asphalt aria-expanded:bg-asphalt aria-[disabled=false]:hover:bg-asphalt/60',
            {
              'aria-[disabled=false]:hover:bg-asphalt/60': !selectedAccount && !open && !isDisabled,
              'aria-[disabled=false]:hover:bg-gray-300/30 bg-gray-300/15': !isDisabled && !open && selectedAccount,
              'opacity-50': isDisabled,
            }
          )}
        >
          {match({ loading, isSelectedAccount: !!selectedAccount })
            .with({ loading: true }, () => <Loader />)
            .with({ isSelectedAccount: true }, () => (
              <div className="flex items-center gap-2.5 min-w-0">
                <BlockchainIcon blockchain={selectedAccount!.blockchain} type="gray" />

                <span className="text-white text-start">
                  {StringHelper.truncateStringMiddle(selectedAccount!.address, 8)}
                </span>
              </div>
            ))
            .otherwise(() => (
              <span className="text-center text-neon font-medium w-full">{t('placeholder')}</span>
            ))}
        </Select.Trigger>
      )}

      <Select.Content align="end" side="bottom" className="max-w-48 max-h-60" isTriggerWidth={false}>
        {match(filteredAccounts.length)
          .with(0, () => <p className="py-2.5 text-center text-xs text-gray-100">{t('empty')}</p>)
          .otherwise(() =>
            filteredAccounts.map((account, index) => (
              <Fragment key={account.id}>
                <Select.Item value={account.id} className="gap-2.5 justify-start">
                  <BlockchainIcon className="w-4 min-w-4 h-4 min-h-4 " blockchain={account.blockchain} type="gray" />

                  <div className="flex flex-col min-w-0 gap-0.5 flex-grow">
                    <Select.ItemText>{StringHelper.truncateStringMiddle(account.address, 8)}</Select.ItemText>

                    <span className="text-1xs text-gray-100 truncate text-left">
                      {`${account.name} | ${account.wallet.name}`}
                    </span>
                  </div>

                  {!withoutIndicator && <Select.ItemRadialIndicator />}
                </Select.Item>

                {index + 1 !== filteredAccounts.length && <Select.Separator />}
              </Fragment>
            ))
          )}
      </Select.Content>
    </Select.Root>
  )
}
