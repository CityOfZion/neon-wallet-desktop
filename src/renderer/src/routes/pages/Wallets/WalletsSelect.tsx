import { Fragment } from 'react'

import { useTranslation } from 'react-i18next'

import { Select } from '@renderer/components/Select'

import { TWallet } from '@shared/types/store'

import { WalletSelectItem } from './WalletSelectItem'

type TProps = {
  value?: TWallet
  disabled?: boolean
  onSelect?: (wallet: TWallet) => void
  wallets: TWallet[]
}

export const WalletsSelect = ({ wallets, value, onSelect }: TProps) => {
  const { t } = useTranslation('components', { keyPrefix: 'walletsSelect' })

  const handleValueChange = (value: string) => {
    const wallet = wallets.find(wallet => wallet.id === value)
    if (!wallet) return
    onSelect?.(wallet)
  }

  return (
    <Select.Root value={value?.id} onValueChange={handleValueChange}>
      <Select.Trigger className="max-w-46.5 py-1.5">
        <div className="flex min-w-0 flex-col [&>span]:w-full [&>span]:truncate">
          <span className="text-left text-xs text-gray-300">{t('title')}</span>
          <Select.Value aria-label={value?.name} placeholder={t('placeholder')}>
            {value?.name}
          </Select.Value>
        </div>

        <Select.Icon />
      </Select.Trigger>

      <Select.Content>
        {wallets.map((wallet, index) => (
          <Fragment key={wallet.id}>
            <WalletSelectItem wallet={wallet} />

            {index + 1 !== wallets.length && <Select.Separator />}
          </Fragment>
        ))}
      </Select.Content>
    </Select.Root>
  )
}
