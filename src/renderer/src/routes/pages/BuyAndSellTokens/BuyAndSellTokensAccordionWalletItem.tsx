import WalletIcon from '@renderer/assets/images/wallet-icon.svg?react'
import { Accordion } from '@renderer/components/Accordion'
import { Loader } from '@renderer/components/Loader'
import { Separator } from '@renderer/components/Separator'
import { Tooltip } from '@renderer/components/Tooltip'
import { NumberHelper } from '@renderer/helpers/NumberHelper'
import { useBalances } from '@renderer/hooks/useBalances'
import { useCurrencySelector } from '@renderer/hooks/useSettingsSelector'
import { IWalletState } from '@shared/@types/store'

import { BuyAndSellTokensAccordionAccountItem } from './BuyAndSellTokensAccordionAccountItem'

type TProps = {
  wallet: IWalletState
}

export const BuyAndSellTokensAccordionWalletItem = ({ wallet }: TProps) => {
  const { id, accounts } = wallet

  const balances = useBalances(accounts)
  const { currency } = useCurrencySelector()

  const total = NumberHelper.currency(balances.exchangeTotal, currency.label)

  return (
    <Accordion.Item value={id} className="w-full">
      <Accordion.Trigger
        className="border-none flex justify-between items-center bg-gray-300/20 rounded gap-x-2"
        iconClassName="text-white"
      >
        <div>
          <WalletIcon className="stroke-blue" />
        </div>

        <h4 className="text-left text-xs font-semibold text-white flex-grow">{wallet.name}</h4>

        {balances.isLoading ? (
          <Loader className="text-gray-300 w-4 h-4" containerClassName="w-fit" />
        ) : (
          <Tooltip title={total}>
            <span className="text-gray-300 text-xs truncate max-w-[100px] text-right uppercase whitespace-nowrap">
              {total}
            </span>
          </Tooltip>
        )}
      </Accordion.Trigger>

      <Accordion.Content asChild className="p-0">
        <ul className="flex flex-col">
          {accounts.map((account, index) => (
            <li key={account.id} className="w-full">
              <BuyAndSellTokensAccordionAccountItem account={account} />

              {accounts.length !== index + 1 && <Separator />}
            </li>
          ))}
        </ul>
      </Accordion.Content>
    </Accordion.Item>
  )
}
