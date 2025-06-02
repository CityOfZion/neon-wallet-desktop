import { useTranslation } from 'react-i18next'
import { OverviewCharts } from '@renderer/components/OverviewCharts'
import { Separator } from '@renderer/components/Separator'
import { useAccountsSelector } from '@renderer/hooks/useAccountSelector'
import { useBalances } from '@renderer/hooks/useBalances'
import { useWalletsSelector } from '@renderer/hooks/useWalletSelector'

export const PortfolioOverviewPage = () => {
  const { t } = useTranslation('pages', { keyPrefix: 'portfolio.portfolioOverview' })
  const { accounts } = useAccountsSelector()
  const { wallets } = useWalletsSelector()
  const balances = useBalances(accounts)

  return (
    <section className="flex h-full w-full min-w-0 flex-col rounded bg-gray-800 px-4 py-3 shadow-lg">
      <div className="mb-3 flex justify-between text-sm">
        <h1 className="text-white">{t('overview')}</h1>

        {wallets && accounts && (
          <span className="text-gray-300">
            {t('walletsAndAccounts', { wallets: wallets.length, accounts: accounts.length })}
          </span>
        )}
      </div>

      <Separator />

      <OverviewCharts balances={balances} balanceChartClassName="px-7" chartCardListClassName="px-7" />
    </section>
  )
}
