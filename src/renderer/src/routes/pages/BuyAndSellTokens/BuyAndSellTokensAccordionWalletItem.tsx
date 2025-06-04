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
        className="flex items-center justify-between gap-x-2 rounded border-none bg-gray-300/20"
        iconClassName="text-white"
      >
        <div>
          <WalletIcon aria-hidden={true} className="stroke-blue" />
        </div>

        <h4 className="flex-grow text-left text-xs font-semibold text-white">{wallet.name}</h4>

        {balances.isLoading ? (
          <Loader className="h-4 w-4 text-gray-300" containerClassName="w-fit" />
        ) : (
          <Tooltip title={total}>
            <span className="max-w-[100px] truncate whitespace-nowrap text-right text-xs uppercase text-gray-300">
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
