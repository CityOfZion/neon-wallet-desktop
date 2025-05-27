import { Fragment } from 'react'
import { useTranslation } from 'react-i18next'
import { RefreshAction } from '@renderer/components/RefreshAction'
import { Separator } from '@renderer/components/Separator'
import { TransactionActivityList } from '@renderer/components/TransactionActivityList'
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
      <div className="flex justify-between items-center text-sm mb-3 gap-x-4 h-5 max-h-5 min-h-5">
        <h1 className="text-white">{t('allActivity')}</h1>

        <div className="flex items-center gap-x-4">
          {wallets && accounts && (
            <Fragment>
              <span className="text-gray-300">
                {t('walletsAndAccounts', { wallets: wallets.length, accounts: accounts.length })}
              </span>

              <Separator containerClassName="w-0 h-full" className="w-px h-7" />
            </Fragment>
          )}

          <RefreshAction />
        </div>
      </div>

      <Separator />

      <div className="flex w-full justify-end items-center gap-x-2 pt-3 text-xl">
        <span className="text-gray-300">{t('balance')}</span>
        <span className="text-white">{NumberHelper.currency(balances.exchangeTotal, currency.label)}</span>
      </div>

      <TransactionActivityList defaultAccounts={accounts} />
    </section>
  )
}
