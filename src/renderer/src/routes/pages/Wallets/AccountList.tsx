import { motion } from 'motion/react'

import { AccountIcon } from '@renderer/components/AccountIcon'
import { Separator } from '@renderer/components/Separator'
import { Tooltip } from '@renderer/components/Tooltip'

import { CurrencyHelper } from '@renderer/helpers/CurrencyHelper'
import { TestHelper } from '@renderer/helpers/TestHelper'

import { useAccountsByWalletIdSelector } from '@renderer/hooks/useAccountSelector'
import { useBalances } from '@renderer/hooks/useBalances'
import { useCurrencySelector } from '@renderer/hooks/useSettingsSelector'

import { IAccountState, IWalletState } from '@shared/types/store'

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

  const totalExchangeFormatted = CurrencyHelper.format(balance.exchangeTotal, { currency })

  return (
    <div className="relative">
      {active && (
        <motion.div
          layoutId="accountActiveIndicator"
          className="bg-neon absolute top-0 left-0 z-11 h-full w-0.75"
          transition={{ duration: 0.15, ease: [0.4, 0, 0.2, 1] }}
        />
      )}

      <button
        onClick={onClick}
        aria-selected={active}
        className="relative flex w-full min-w-0 cursor-pointer items-center gap-x-2.5 px-3 py-2.5 transition-colors hover:bg-gray-900/50 aria-selected:bg-gray-900/50"
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
    </div>
  )
}

export const AccountList = ({ selectedWallet, selectedAccount, onSelect }: TProps) => {
  const { accountsByWalletId } = useAccountsByWalletIdSelector(selectedWallet.id)

  return (
    <ul
      {...TestHelper.buildTestObject('accounts-wallet-list')}
      className="flex min-h-0 w-full min-w-0 grow flex-col overflow-y-auto"
    >
      {accountsByWalletId.map(account => (
        <li className="group" key={account?.id}>
          <AccountItem
            onClick={() => onSelect(account)}
            account={account}
            active={account.id === selectedAccount?.id}
          />

          <Separator containerClassName="group-last:hidden" />
        </li>
      ))}
    </ul>
  )
}
