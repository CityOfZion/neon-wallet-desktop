import { Fragment } from 'react'

import * as dateFns from 'date-fns'
import { useTranslation } from 'react-i18next'

import { RefreshAction } from '@renderer/components/RefreshAction'
import { Separator } from '@renderer/components/Separator'
import { TransactionActivityList } from '@renderer/components/TransactionActivityList'

import { CurrencyHelper } from '@renderer/helpers/CurrencyHelper'
import { DateHelper } from '@renderer/helpers/DateHelper'

import { useAccountsSelector } from '@renderer/hooks/useAccountSelector'
import { useActions } from '@renderer/hooks/useActions'
import { useBalances } from '@renderer/hooks/useBalances'
import { useCurrencySelector } from '@renderer/hooks/useSettingsSelector'
import { useWalletsSelector } from '@renderer/hooks/useWalletSelector'

type TActionsData = {
  dateFrom: Date
  dateTo: Date
}

const dateNow = new Date()

const PortfolioActivityPage = () => {
  const { t } = useTranslation('pages', { keyPrefix: 'portfolio.portfolioActivity' })
  const { accounts } = useAccountsSelector()
  const { wallets } = useWalletsSelector()
  const { currency } = useCurrencySelector()
  const balances = useBalances(accounts)

  const { actionData, setData } = useActions<TActionsData>({
    dateFrom: dateFns.startOfMonth(dateNow),
    dateTo: dateNow,
  })

  const { dateFrom, dateTo } = actionData

  const handleSelectDateFrom = async (dateFrom: Date) => {
    setData(DateHelper.calculateDateFromSelectionMaxOneYear({ dateFrom, dateTo }))
  }

  const handleSelectDateTo = async (dateTo: Date) => {
    setData(DateHelper.calculateDateToSelectionMaxOneYear({ dateFrom, dateTo }))
  }

  return (
    <Fragment>
      <div className="mb-3 flex h-5 max-h-5 min-h-5 items-center justify-between gap-x-4 text-sm">
        <h1 className="text-white">{t('allActivity')}</h1>

        <div className="flex items-center gap-x-4">
          {wallets && accounts && (
            <Fragment>
              <span className="text-gray-300">
                {t('walletsAndAccounts', { wallets: wallets.length, accounts: accounts.length })}
              </span>

              <Separator containerClassName="w-0 h-full" className="h-7 w-px" />
            </Fragment>
          )}

          <RefreshAction />
        </div>
      </div>

      <Separator />

      <div className="flex w-full items-center justify-end gap-x-2 pt-3 text-xl">
        <span className="text-gray-300">{t('balance')}</span>
        <span className="text-white">{CurrencyHelper.format(balances.exchangeTotal, { currency })}</span>
      </div>

      <TransactionActivityList
        defaultAccounts={accounts}
        dateFrom={actionData.dateFrom}
        dateTo={actionData.dateTo}
        onSelectDateFrom={handleSelectDateFrom}
        onSelectDateTo={handleSelectDateTo}
        shouldUseFullTransactionsService={false}
      />
    </Fragment>
  )
}

export default PortfolioActivityPage
