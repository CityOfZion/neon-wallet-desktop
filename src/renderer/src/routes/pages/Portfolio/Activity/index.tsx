import { useTranslation } from 'react-i18next'
import { Separator } from '@renderer/components/Separator'
import { TransactionsTable } from '@renderer/components/TransactionsTable'
import { NumberHelper } from '@renderer/helpers/NumberHelper'
import { useAccountsSelector } from '@renderer/hooks/useAccountSelector'
import { useBalances } from '@renderer/hooks/useBalances'
import { useCurrencySelector } from '@renderer/hooks/useSettingsSelector'
import { useWalletsSelector } from '@renderer/hooks/useWalletSelector'

export const PortfolioActivityPage = () => {
  const { t } = useTranslation('pages', { keyPrefix: 'portfolio.portfolioActivity' })
  const { accounts } = useAccountsSelector()
  const { wallets } = useWalletsSelector()
  const { currency } = useCurrencySelector()
  const balances = useBalances(accounts)

  return (
    <section className="w-full flex flex-col bg-gray-800 rounded shadow-lg py-3 h-full px-4 min-w-0">
      <div className="flex justify-between text-sm mb-3">
        <h1 className="text-white">{t('allActivity')}</h1>

        {wallets && accounts && (
          <span className="text-gray-300">
            {t('walletsAndAccounts', { wallets: wallets.length, accounts: accounts.length })}
          </span>
        )}
      </div>

      <div className="h-1 w-full">
        <Separator />
      </div>

      <div className="w-full flex justify-end">
        <div className="flex gap-2 pt-7 text-xl ml-2">
          <span className="text-gray-300">{t('balance')}</span>
          <span className=" text-white">{NumberHelper.currency(balances.exchangeTotal, currency.label)}</span>
        </div>
      </div>

      <ul className="w-full flex flex-col flex-grow py-3 min-h-0">
        <TransactionsTable accounts={accounts} tableHeaderClassName="bg-gray-800" />
      </ul>
    </section>
  )
}
