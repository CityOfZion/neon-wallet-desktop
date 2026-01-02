import { Select } from '@renderer/components/Select'
import { Tooltip } from '@renderer/components/Tooltip'
import { WalletIcon } from '@renderer/components/WalletIcon'

import { CurrencyHelper } from '@renderer/helpers/CurrencyHelper'
import { StyleHelper } from '@renderer/helpers/StyleHelper'

import { useAccountsByWalletIdSelector } from '@renderer/hooks/useAccountSelector'
import { useBalances } from '@renderer/hooks/useBalances'
import { useCurrencySelector } from '@renderer/hooks/useSettingsSelector'

import { IWalletState } from '@shared/types/store'

type TProps = {
  wallet: IWalletState
}

export const WalletSelectItem = ({ wallet }: TProps) => {
  const { accountsByWalletId } = useAccountsByWalletIdSelector(wallet.id)
  const { currency } = useCurrencySelector()

  const balances = useBalances(accountsByWalletId)

  const exchangeTotalFormatted = CurrencyHelper.format(balances.exchangeTotal, { currency })

  return (
    <Select.Item
      value={wallet.id}
      className="hover:border-l-neon data-[state=checked]:border-l-neon cursor-pointer border-l-4 border-l-transparent pl-4 transition-colors"
    >
      <div className={StyleHelper.mergeStyles('flex min-w-0 items-center gap-x-1')}>
        <WalletIcon wallet={wallet} />

        <div className="flex min-w-0 grow flex-col gap-x-2">
          <p className="truncate text-xs text-gray-100">{wallet.name}</p>

          <Tooltip title={exchangeTotalFormatted}>
            <span className="block w-fit max-w-full truncate text-sm text-white">{exchangeTotalFormatted}</span>
          </Tooltip>
        </div>
      </div>
    </Select.Item>
  )
}
