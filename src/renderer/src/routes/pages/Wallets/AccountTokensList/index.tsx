import { useTranslation } from 'react-i18next'
import { useOutletContext } from 'react-router-dom'
import { IAccountState } from '@renderer/@types/store'
import { TokensTable } from '@renderer/components/TokensTable'
import { NumberHelper } from '@renderer/helpers/NumberHelper'
import { useBalances } from '@renderer/hooks/useBalances'
import { useCurrencySelector } from '@renderer/hooks/useSettingsSelector'
import { AccountDetailsLayout } from '@renderer/layouts/AccountDetailsLayout'

import { CommonAccountActions } from '../CommonAccountActions'

type TOutletContext = {
  account: IAccountState
}

export const AccountTokensList = () => {
  const { t } = useTranslation('pages', { keyPrefix: 'wallets.accountTokensList' })

  const { account } = useOutletContext<TOutletContext>()
  const { currency } = useCurrencySelector()

  const balances = useBalances([account])

  const exchangeTotalFormatted = NumberHelper.currency(balances.exchangeTotal, currency.label)

  return (
    <AccountDetailsLayout title={t('title')} actions={account ? <CommonAccountActions account={account} /> : undefined}>
      <div className="text-right pt-4">
        <span className="text-gray-300">{t('balance')}</span>
        <span>{exchangeTotalFormatted}</span>
      </div>
      <TokensTable balances={balances} />
    </AccountDetailsLayout>
  )
}
