import { Fragment } from 'react'
import { useTranslation } from 'react-i18next'
import { Select } from '@renderer/components/Select'
import { IWalletState } from '@shared/@types/store'

import { WalletSelectItem } from './WalletSelectItem'

type TProps = {
  value?: IWalletState
  disabled?: boolean
  onSelect?: (wallet: IWalletState) => void
  wallets: IWalletState[]
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
      <Select.Trigger className="max-w-[11.625rem] py-1.5">
        <div className="flex flex-col min-w-0 [&>span]:truncate [&>span]:w-full">
          <span className="text-xs text-gray-300 text-left">{t('title')}</span>
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
