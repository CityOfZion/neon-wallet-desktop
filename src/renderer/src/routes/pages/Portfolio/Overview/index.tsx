import { Fragment } from 'react'

import { useTranslation } from 'react-i18next'

import { OverviewCharts } from '@renderer/components/OverviewCharts'
import { Separator } from '@renderer/components/Separator'

import { useAccountsSelector } from '@renderer/hooks/useAccountSelector'
import { useBalances } from '@renderer/hooks/useBalances'
import { useWalletsSelector } from '@renderer/hooks/useWalletSelector'

const PortfolioOverviewPage = () => {
  const { t } = useTranslation('pages', { keyPrefix: 'portfolio.portfolioOverview' })
  const { accounts } = useAccountsSelector()
  const { wallets } = useWalletsSelector()
  const balances = useBalances(accounts)

  return (
    <Fragment>
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
    </Fragment>
  )
}

export default PortfolioOverviewPage
