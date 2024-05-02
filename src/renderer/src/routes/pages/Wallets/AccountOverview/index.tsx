import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useOutletContext } from 'react-router-dom'
import { IAccountState } from '@renderer/@types/store'
import { BalanceChart } from '@renderer/components/BalanceChart'
import { BalanceHelper } from '@renderer/helpers/BalanceHelper'
import { NumberHelper } from '@renderer/helpers/NumberHelper'
import { useBalancesAndExchange } from '@renderer/hooks/useBalancesAndExchange'
import { useCurrencySelector } from '@renderer/hooks/useSettingsSelector'
import { AccountDetailsLayout } from '@renderer/layouts/AccountDetailsLayout'

import { CommonAccountActions } from '../CommonAccountActions'

type TOutletContext = {
  account: IAccountState
}

export const AccountOverview = () => {
  const { t } = useTranslation('pages', { keyPrefix: 'wallets.accountOverview' })

  const { account } = useOutletContext<TOutletContext>()

  const { currency } = useCurrencySelector()

  const balanceExchange = useBalancesAndExchange(account ? [account] : [])

  const formattedTotalTokensBalances = useMemo(
    () =>
      NumberHelper.currency(
        BalanceHelper.calculateTotalBalances(balanceExchange.balance.data, balanceExchange.exchange.data) || 0,
        currency.label
      ),
    [balanceExchange.balance.data, balanceExchange.exchange.data, currency.label]
  )

  return (
    <AccountDetailsLayout title={t('title')} actions={account ? <CommonAccountActions account={account} /> : undefined}>
      <div className="flex flex-col h-full items-center justify-center w-full">
        <div className="flex justify-between items-center w-full text-sm mb-3 px-2">
          <h1 className="text-gray-200">{t('holdings')}</h1>

          <div className="flex gap-2">
            <span className="text-gray-300">{t('balance')}</span>
            <span className="text-white">{formattedTotalTokensBalances}</span>
          </div>
        </div>

        <BalanceChart balanceExchange={balanceExchange} />
      </div>
    </AccountDetailsLayout>
  )
}
