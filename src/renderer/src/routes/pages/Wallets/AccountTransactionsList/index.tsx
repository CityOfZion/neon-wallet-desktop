import { hasFullTransactions } from '@cityofzion/blockchain-service'
import * as dateFns from 'date-fns'
import { useTranslation } from 'react-i18next'
import { useOutletContext } from 'react-router'

import { Button } from '@renderer/components/Button'
import { TransactionActivityList } from '@renderer/components/TransactionActivityList'

import { BlockchainServiceHelper } from '@renderer/helpers/BlockchainServiceHelper'
import { ExportTransactionsHelper } from '@renderer/helpers/ExportTransactionsHelper'

import { useActions } from '@renderer/hooks/useActions'
import { useModalNavigate } from '@renderer/hooks/useModalRouter'

import TbFileExport from '@renderer/assets/images/tb-file-export.svg?react'

import { TAccount } from '@shared/types/store'

import { AccountDetailsLayout } from '../AccountDetailsLayout'
import { CommonAccountActions } from '../CommonAccountActions'

type TOutletContext = {
  account: TAccount
}

type TActionsData = {
  dateFrom: Date
  dateTo: Date
}

const AccountTransactionsList = () => {
  const { t } = useTranslation('pages', { keyPrefix: 'wallets.accountTransactionsList' })
  const { account } = useOutletContext<TOutletContext>()
  const { modalNavigateWrapper } = useModalNavigate()

  const accounts = account ? [account] : []
  const dateNow = new Date()

  const { actionData, setData } = useActions<TActionsData>({
    dateFrom: dateFns.startOfMonth(dateNow),
    dateTo: dateNow,
  })

  const { dateFrom, dateTo } = actionData

  const service = account
    ? BlockchainServiceHelper.bsAggregator.blockchainServicesByName[account.blockchain]
    : undefined
  const shouldUseFullTransactionsService = !!service && hasFullTransactions(service)

  const handleSelectDateFrom = async (dateFrom: Date) => {
    setData(ExportTransactionsHelper.calculateDateFromSelectionMaxOneYear({ dateFrom, dateTo }))
  }

  const handleSelectDateTo = async (dateTo: Date) => {
    setData(ExportTransactionsHelper.calculateDateToSelectionMaxOneYear({ dateFrom, dateTo }))
  }

  return (
    <AccountDetailsLayout
      heading={<h1 className="text-sm text-white">{t('title')}</h1>}
      actions={
        account ? (
          <CommonAccountActions account={account}>
            {shouldUseFullTransactionsService && (
              <Button
                leftIcon={<TbFileExport aria-hidden />}
                label={t('exportCSVButtonLabel')}
                variant="text"
                flat
                onClick={modalNavigateWrapper('export-full-transactions', { state: { account, dateFrom, dateTo } })}
              />
            )}
          </CommonAccountActions>
        ) : undefined
      }
    >
      <TransactionActivityList
        defaultAccounts={accounts}
        dateFrom={dateFrom}
        dateTo={dateTo}
        onSelectDateFrom={handleSelectDateFrom}
        onSelectDateTo={handleSelectDateTo}
        shouldUseFullTransactionsService={shouldUseFullTransactionsService}
      />
    </AccountDetailsLayout>
  )
}

export default AccountTransactionsList
