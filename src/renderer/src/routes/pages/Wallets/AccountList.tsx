import { Fragment } from 'react'

import { AccountIcon } from '@renderer/components/AccountIcon'
import { Separator } from '@renderer/components/Separator'
import { Tooltip } from '@renderer/components/Tooltip'

import { NumberHelper } from '@renderer/helpers/NumberHelper'
import { TestHelper } from '@renderer/helpers/TestHelper'

import { useAccountsByWalletIdSelector } from '@renderer/hooks/useAccountSelector'
import { useBalances } from '@renderer/hooks/useBalances'
import { useCurrencySelector } from '@renderer/hooks/useSettingsSelector'

import { IAccountState, IWalletState } from '@shared/@types/store'

type TProps = {
  onSelect: (account: IAccountState) => void
  selectedAccount?: IAccountState | undefined
  selectedWallet: IWalletState
}

type TAccountItemProps = {
  account: IAccountState
  active?: boolean
  onClick?: () => void
}

const AccountItem = ({ account, onClick, active }: TAccountItemProps) => {
  const balance = useBalances([account])
  const { currency } = useCurrencySelector()

  const totalExchangeFormatted = NumberHelper.currency(balance.exchangeTotal, currency.label)

  return (
    <li>
      <button
        onClick={onClick}
        aria-selected={active}
        className="hover:border-l-neon aria-selected:border-l-neon flex w-full min-w-0 cursor-pointer items-center gap-x-2.5 border-l-4 border-l-transparent px-3 py-2.5 transition-colors hover:bg-gray-900/50 aria-selected:bg-gray-900/50"
      >
        <AccountIcon account={account} />

        <div className="flex min-w-0 grow flex-col gap-x-2">
          <p className="truncate text-left text-xs text-white">{account.name}</p>

          <Tooltip title={totalExchangeFormatted}>
            <span className="inline-block w-fit max-w-24 truncate text-left text-xs text-gray-100">
              {totalExchangeFormatted}
            </span>
          </Tooltip>
        </div>
      </button>
    </li>
  )
}

export const AccountList = ({ selectedWallet, selectedAccount, onSelect }: TProps) => {
  const { accountsByWalletId } = useAccountsByWalletIdSelector(selectedWallet.id)

  return (
    <ul
      {...TestHelper.buildTestObject('accounts-wallet-list')}
      className="flex min-h-0 w-full min-w-0 grow flex-col overflow-y-auto"
    >
      {accountsByWalletId.map((account, index) => (
        <Fragment key={account?.id}>
          <AccountItem
            onClick={() => onSelect(account)}
            account={account}
            active={account.id === selectedAccount?.id}
          />

          {index + 1 !== accountsByWalletId.length && <Separator />}
        </Fragment>
      ))}
    </ul>
  )
}
