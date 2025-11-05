import { isClaimable } from '@cityofzion/blockchain-service'
import { useTranslation } from 'react-i18next'
import { useOutletContext } from 'react-router'

import { OverviewCharts } from '@renderer/components/OverviewCharts'

import { useBalances } from '@renderer/hooks/useBalances'

import { AccountDetailsLayout } from '@renderer/layouts/AccountDetailsLayout'

import { bsAggregator } from '@renderer/libs/blockchain-service'
import { IAccountState } from '@shared/@types/store'

import { ClaimGasBanner } from '../ClaimGasBanner'
import { CommonAccountActions } from '../CommonAccountActions'

type TOutletContext = {
  account: IAccountState
}

const AccountOverview = () => {
  const { t } = useTranslation('pages', { keyPrefix: 'wallets.accountOverview' })
  const { account } = useOutletContext<TOutletContext>()
  const balances = useBalances([account])

  const blockchainService = bsAggregator.blockchainServicesByName[account.blockchain]

  return (
    <AccountDetailsLayout
      heading={t('title')}
      actions={account ? <CommonAccountActions account={account} /> : undefined}
    >
      <div className="flex w-full grow flex-col items-center justify-center">
        <OverviewCharts balances={balances} account={account}>
          {balances.exchangeTotal > 0 && isClaimable(blockchainService) && account.type !== 'watch' && (
            <ClaimGasBanner blockchainService={blockchainService} account={account} />
          )}
        </OverviewCharts>
      </div>
    </AccountDetailsLayout>
  )
}

export default AccountOverview
