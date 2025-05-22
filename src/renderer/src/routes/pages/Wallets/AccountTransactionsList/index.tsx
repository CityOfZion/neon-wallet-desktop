import { useTranslation } from 'react-i18next'
import { TbFileExport } from 'react-icons/tb'
import { useOutletContext } from 'react-router-dom'
import { Button } from '@renderer/components/Button'
import { Switch } from '@renderer/components/Switch'
import { TransactionActivityList } from '@renderer/components/TransactionActivityList'
import { TransactionsTable } from '@renderer/components/TransactionsTable'
import { useActions } from '@renderer/hooks/useActions'
import { useModalNavigate } from '@renderer/hooks/useModalRouter'
import { AccountDetailsLayout } from '@renderer/layouts/AccountDetailsLayout'
import { IAccountState } from '@shared/@types/store'

import { CommonAccountActions } from '../CommonAccountActions'

type TActionsData = {
  newPage: boolean
}

type TOutletContext = {
  account: IAccountState
}

export const AccountTransactionsList = () => {
  const { t } = useTranslation('pages', { keyPrefix: 'wallets.accountTransactionsList' })
  const { account } = useOutletContext<TOutletContext>()
  const { modalNavigateWrapper } = useModalNavigate()

  const {
    actionData: { newPage },
    setDataFromEventWrapper,
  } = useActions<TActionsData>({ newPage: true })

  const accounts = account ? [account] : []

  return (
    <AccountDetailsLayout
      heading={
        <div className="flex items-center gap-x-4">
          <h1 className="text-white text-sm">{t('title')}</h1>
          <Switch
            label={t('newPageLabel')}
            name="new-page"
            checked={newPage}
            onChange={setDataFromEventWrapper('newPage')}
          />
        </div>
      }
      actions={
        account ? (
          <CommonAccountActions account={account}>
            <Button
              leftIcon={<TbFileExport aria-hidden />}
              label={t('exportCSVButtonLabel')}
              variant="text"
              flat
              onClick={modalNavigateWrapper('export-full-transactions', { state: { account } })}
            />
          </CommonAccountActions>
        ) : undefined
      }
    >
      {newPage ? (
        <TransactionActivityList defaultAccounts={accounts} />
      ) : (
        <TransactionsTable accounts={accounts} showSimplified tableHeaderClassName="bg-gray-950" />
      )}
    </AccountDetailsLayout>
  )
}
