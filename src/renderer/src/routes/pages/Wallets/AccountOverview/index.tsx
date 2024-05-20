import { useTranslation } from 'react-i18next'
import { useOutletContext } from 'react-router-dom'
import { isClaimable } from '@cityofzion/blockchain-service'
import { IAccountState } from '@renderer/@types/store'
import { BalanceChart } from '@renderer/components/BalanceChart'
import { NumberHelper } from '@renderer/helpers/NumberHelper'
import { useBalances } from '@renderer/hooks/useBalances'
import { useCurrencySelector } from '@renderer/hooks/useSettingsSelector'
import { AccountDetailsLayout } from '@renderer/layouts/AccountDetailsLayout'
import { bsAggregator } from '@renderer/libs/blockchainService'

import { ClaimGasBanner } from '../ClaimGasBanner'
import { CommonAccountActions } from '../CommonAccountActions'

type TOutletContext = {
  account: IAccountState
}

export const AccountOverview = () => {
  const { t } = useTranslation('pages', { keyPrefix: 'wallets.accountOverview' })
  const { currency } = useCurrencySelector()
  const { account } = useOutletContext<TOutletContext>()

  const blockchainService = bsAggregator.blockchainServicesByName[account.blockchain]
  const balances = useBalances([account])

  const exchangeTotalFormatted = NumberHelper.currency(balances.exchangeTotal, currency.label)

  return (
    <AccountDetailsLayout title={t('title')} actions={account ? <CommonAccountActions account={account} /> : undefined}>
      <div className="flex flex-col h-full items-center justify-center w-full">
        <div className="flex justify-between items-center w-full text-sm mb-3 px-2">
          <h1 className="text-gray-200">{t('holdings')}</h1>

          <div className="flex gap-2">
            <span className="text-gray-300">{t('balance')}</span>
            <span className="text-white">{exchangeTotalFormatted}</span>
          </div>
        </div>

        <BalanceChart balances={balances} />

        {isClaimable(blockchainService) && <ClaimGasBanner blockchainService={blockchainService} account={account} />}
      </div>
    </AccountDetailsLayout>
  )
}
