import { isClaimable } from '@cityofzion/blockchain-service'
import { useTranslation } from 'react-i18next'
import { useOutletContext } from 'react-router'

import { OverviewCharts } from '@renderer/components/OverviewCharts'

import { BlockchainServiceHelper } from '@renderer/helpers/BlockchainServiceHelper'

import { useBalances } from '@renderer/hooks/useBalances'

import { TAccount } from '@shared/types/store'

import { AccountDetailsLayout } from '../AccountDetailsLayout'
import { ClaimGasBanner } from '../ClaimGasBanner'
import { CommonAccountActions } from '../CommonAccountActions'

type TOutletContext = {
  account: TAccount
}

const AccountOverview = () => {
  const { t } = useTranslation('pages', { keyPrefix: 'wallets.accountOverview' })
  const { account } = useOutletContext<TOutletContext>()
  const balances = useBalances([account])

  const blockchainService = BlockchainServiceHelper.bsAggregator.blockchainServicesByName[account.blockchain]

  return (
    <AccountDetailsLayout
      heading={t('title')}
      actions={account ? <CommonAccountActions account={account} /> : undefined}
    >
      <div className="flex w-full grow flex-col items-center justify-center">
        <OverviewCharts balances={balances} account={account}>
          {isClaimable(blockchainService) && <ClaimGasBanner blockchainService={blockchainService} account={account} />}
        </OverviewCharts>
      </div>
    </AccountDetailsLayout>
  )
}

export default AccountOverview
