import { useTranslation } from 'react-i18next'
import { useOutletContext } from 'react-router-dom'
import { isClaimable } from '@cityofzion/blockchain-service'
import { OverviewCharts } from '@renderer/components/OverviewCharts'
import { useBalances } from '@renderer/hooks/useBalances'
import { AccountDetailsLayout } from '@renderer/layouts/AccountDetailsLayout'
import { bsAggregator } from '@renderer/libs/blockchainService'
import { IAccountState } from '@shared/@types/store'

import { ClaimGasBanner } from '../ClaimGasBanner'
import { CommonAccountActions } from '../CommonAccountActions'

type TOutletContext = {
  account: IAccountState
}

export const AccountOverview = () => {
  const { t } = useTranslation('pages', { keyPrefix: 'wallets.accountOverview' })
  const { account } = useOutletContext<TOutletContext>()

  const blockchainService = bsAggregator.blockchainServicesByName[account.blockchain]
  const balances = useBalances([account])

  return (
    <AccountDetailsLayout title={t('title')} actions={account ? <CommonAccountActions account={account} /> : undefined}>
      <div className="flex flex-col h-full items-center w-full justify-center">
        <OverviewCharts balances={balances} account={account} balanceChartClassName="h-2/6">
          {balances.exchangeTotal > 0 && isClaimable(blockchainService) && (
            <ClaimGasBanner blockchainService={blockchainService} account={account} />
          )}
        </OverviewCharts>
      </div>
    </AccountDetailsLayout>
  )
}
