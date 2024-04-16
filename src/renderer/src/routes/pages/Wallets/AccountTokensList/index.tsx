import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useOutletContext } from 'react-router-dom'
import { IAccountState } from '@renderer/@types/store'
import { TokensTable } from '@renderer/components/TokensTable'
import { BalanceHelper } from '@renderer/helpers/BalanceHelper'
import { FilterHelper } from '@renderer/helpers/FilterHelper'
import { useBalancesAndExchange } from '@renderer/hooks/useBalancesAndExchange'
import { AccountDetailsLayout } from '@renderer/layouts/AccountDetailsLayout'

import { CommonAccountActions } from '../CommonAccountActions'

type TOutletContext = {
  account: IAccountState
}

export const AccountTokensList = () => {
  const { t } = useTranslation('pages', { keyPrefix: 'wallets.accountTokensList' })

  const { account } = useOutletContext<TOutletContext>()

  const balanceExchange = useBalancesAndExchange(account ? [account] : [])

  const formattedTotalTokensBalances = useMemo(
    () =>
      FilterHelper.currency(
        BalanceHelper.calculateTotalBalances(balanceExchange.balance.data, balanceExchange.exchange.data)
      ),
    [balanceExchange.balance.data, balanceExchange.exchange.data]
  )

  return (
    <AccountDetailsLayout title={t('title')} actions={account ? <CommonAccountActions account={account} /> : undefined}>
      <div className="text-right pt-4">
        <span className="text-gray-300">{t('balance')}</span> {formattedTotalTokensBalances}
      </div>
      <TokensTable balanceExchange={balanceExchange} />
    </AccountDetailsLayout>
  )
}
