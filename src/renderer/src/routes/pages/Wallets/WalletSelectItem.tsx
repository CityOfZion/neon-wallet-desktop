import { useMemo } from 'react'
import { UseMultipleBalanceAndExchangeResult } from '@renderer/@types/query'
import { IWalletState } from '@renderer/@types/store'
import { Select } from '@renderer/components/Select'
import { Tooltip } from '@renderer/components/Tooltip'
import { WalletIcon } from '@renderer/components/WalletIcon'
import { BalanceHelper } from '@renderer/helpers/BalanceHelper'
import { NumberHelper } from '@renderer/helpers/NumberHelper'
import { StyleHelper } from '@renderer/helpers/StyleHelper'
import { useAccountsByWalletIdSelector } from '@renderer/hooks/useAccountSelector'
import { useCurrencySelector } from '@renderer/hooks/useSettingsSelector'

type TProps = {
  balanceExchange: UseMultipleBalanceAndExchangeResult
  wallet: IWalletState
}

export const WalletSelectItem = ({ balanceExchange, wallet }: TProps) => {
  const { accountsByWalletId } = useAccountsByWalletIdSelector(wallet.id)
  const { currency } = useCurrencySelector()

  const totalTokensBalances = useMemo(
    () =>
      BalanceHelper.calculateTotalBalances(
        balanceExchange.balance.data,
        balanceExchange.exchange.data,
        accountsByWalletId.map(account => account.address)
      ),
    [balanceExchange, accountsByWalletId]
  )

  const formattedTotalTokensBalances = useMemo(
    () => NumberHelper.currency(totalTokensBalances || 0, currency.label),
    [currency.label, totalTokensBalances]
  )

  return (
    <Select.Item
      value={wallet.id}
      className="border-l-transparent border-l-4 pl-4 cursor-pointer hover:border-l-neon transition-colors data-[state=checked]:border-l-neon"
    >
      <div className={StyleHelper.mergeStyles('flex items-center gap-x-1 min-w-0')}>
        <WalletIcon wallet={wallet} />

        <div className="flex flex-col flex-grow min-w-0 gap-x-2">
          <p className="text-xs text-gray-100 truncate">{wallet.name}</p>

          <Tooltip title={formattedTotalTokensBalances}>
            <span className="block w-fit max-w-full text-sm text-white truncate">{formattedTotalTokensBalances}</span>
          </Tooltip>
        </div>
      </div>
    </Select.Item>
  )
}
