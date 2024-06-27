import { Select } from '@renderer/components/Select'
import { Tooltip } from '@renderer/components/Tooltip'
import { WalletIcon } from '@renderer/components/WalletIcon'
import { NumberHelper } from '@renderer/helpers/NumberHelper'
import { StyleHelper } from '@renderer/helpers/StyleHelper'
import { useAccountsByWalletIdSelector } from '@renderer/hooks/useAccountSelector'
import { useBalances } from '@renderer/hooks/useBalances'
import { useCurrencySelector } from '@renderer/hooks/useSettingsSelector'
import { IWalletState } from '@shared/@types/store'

type TProps = {
  wallet: IWalletState
}

export const WalletSelectItem = ({ wallet }: TProps) => {
  const { accountsByWalletId } = useAccountsByWalletIdSelector(wallet.id)
  const { currency } = useCurrencySelector()

  const balances = useBalances(accountsByWalletId)

  const exchangeTotalFormatted = NumberHelper.currency(balances.exchangeTotal, currency.label)

  return (
    <Select.Item
      value={wallet.id}
      className="border-l-transparent border-l-4 pl-4 cursor-pointer hover:border-l-neon transition-colors data-[state=checked]:border-l-neon"
    >
      <div className={StyleHelper.mergeStyles('flex items-center gap-x-1 min-w-0')}>
        <WalletIcon wallet={wallet} />

        <div className="flex flex-col flex-grow min-w-0 gap-x-2">
          <p className="text-xs text-gray-100 truncate">{wallet.name}</p>

          <Tooltip title={exchangeTotalFormatted}>
            <span className="block w-fit max-w-full text-sm text-white truncate">{exchangeTotalFormatted}</span>
          </Tooltip>
        </div>
      </div>
    </Select.Item>
  )
}
