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
    <section className="w-full flex flex-col bg-gray-800 rounded shadow-lg py-3 h-full px-4 min-w-0">
      <div className="flex justify-between text-sm mb-3">
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
