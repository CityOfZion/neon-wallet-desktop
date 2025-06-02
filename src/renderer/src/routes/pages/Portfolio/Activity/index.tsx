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
    <section className="flex h-full w-full min-w-0 flex-col rounded bg-gray-800 px-4 py-3 shadow-lg">
      <div className="mb-3 flex h-5 max-h-5 min-h-5 items-center justify-between gap-x-4 text-sm">
        <h1 className="text-white">{t('allActivity')}</h1>

        <div className="flex items-center gap-x-4">
          {wallets && accounts && (
            <Fragment>
              <span className="text-gray-300">
                {t('walletsAndAccounts', { wallets: wallets.length, accounts: accounts.length })}
              </span>

              <Separator containerClassName="w-0 h-full" className="h-7 w-px" />
            </Fragment>
          )}

          <RefreshAction />
        </div>
      </div>

      <Separator />

      <div className="flex w-full items-center justify-end gap-x-2 pt-3 text-xl">
        <span className="text-gray-300">{t('balance')}</span>
        <span className="text-white">{NumberHelper.currency(balances.exchangeTotal, currency.label)}</span>
      </div>

      <TransactionActivityList defaultAccounts={accounts} />
    </section>
  )
}
