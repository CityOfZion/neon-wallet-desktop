import { useTranslation } from 'react-i18next'
import { useOutletContext } from 'react-router-dom'
import { IAccountState } from '@renderer/@types/store'
import { TransactionsTable } from '@renderer/components/TransactionsTable'
import { AccountDetailsLayout } from '@renderer/layouts/AccountDetailsLayout'

import { CommonAccountActions } from '../CommonAccountActions'

type TOutletContext = {
  account: IAccountState
}

export const AccountTransactionsList = () => {
  const { t } = useTranslation('pages', { keyPrefix: 'wallets.accountTransactionsList' })

  const { account } = useOutletContext<TOutletContext>()

  return (
    <AccountDetailsLayout title={t('title')} actions={account ? <CommonAccountActions account={account} /> : undefined}>
      <TransactionsTable accounts={account ? [account] : []} showSimplified tableHeaderClassName="bg-gray-950" />
    </AccountDetailsLayout>
  )
}
