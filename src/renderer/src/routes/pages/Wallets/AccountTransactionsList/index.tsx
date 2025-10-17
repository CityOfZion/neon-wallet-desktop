import { useTranslation } from 'react-i18next'
import { useOutletContext } from 'react-router'

import { Button } from '@renderer/components/Button'
import { TransactionActivityList } from '@renderer/components/TransactionActivityList'

import { useModalNavigate } from '@renderer/hooks/useModalRouter'

import { AccountDetailsLayout } from '@renderer/layouts/AccountDetailsLayout'

import TbFileExport from '@renderer/assets/images/tb-file-export.svg?react'

import { IAccountState } from '@shared/@types/store'

import { CommonAccountActions } from '../CommonAccountActions'

type TOutletContext = {
  account: IAccountState
}

const AccountTransactionsList = () => {
  const { t } = useTranslation('pages', { keyPrefix: 'wallets.accountTransactionsList' })
  const { account } = useOutletContext<TOutletContext>()
  const { modalNavigateWrapper } = useModalNavigate()

  const accounts = account ? [account] : []

  return (
    <AccountDetailsLayout
      heading={<h1 className="text-sm text-white">{t('title')}</h1>}
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
      <TransactionActivityList defaultAccounts={accounts} />
    </AccountDetailsLayout>
  )
}

export default AccountTransactionsList
