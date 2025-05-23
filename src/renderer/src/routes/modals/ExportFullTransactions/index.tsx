import { useTranslation } from 'react-i18next'
import { TbDeviceFloppy, TbFileExport } from 'react-icons/tb'
import { useNavigate } from 'react-router-dom'
import { Button } from '@renderer/components/Button'
import { Input } from '@renderer/components/Input'
import { SuccessIcon } from '@renderer/components/SuccessIcon'
import { ToastHelper } from '@renderer/helpers/ToastHelper'
import { useActions } from '@renderer/hooks/useActions'
import { useModalNavigate, useModalState } from '@renderer/hooks/useModalRouter'
import { CenterModalLayout } from '@renderer/layouts/CenterModal'
import { bsAggregator } from '@renderer/libs/blockchainService'
import { IAccountState } from '@shared/@types/store'
import * as dateFns from 'date-fns'

import { ExportFullTransactionInfo } from './ExportFullTransactionInfo'

type TModalState = {
  account?: IAccountState
  to?: Date
  from?: Date
}

export type TExportFullTransactionsActionData = {
  account?: IAccountState
  to: Date
  from: Date
  selectedFolderPath?: string
  exported: boolean
}

export const ExportFullTransactionsModal = () => {
  const modalState = useModalState<TModalState>()
  const { t } = useTranslation('modals', { keyPrefix: 'exportFullTransactions' })
  const { modalErase } = useModalNavigate()
  const navigate = useNavigate()

  const today = new Date()

  const { actionData, actionState, setData, handleAct } = useActions<TExportFullTransactionsActionData>({
    account: modalState.account,
    from: modalState.from ?? dateFns.sub(today, { weeks: 1 }),
    to: modalState.to ?? today,
    exported: false,
    selectedFolderPath: undefined,
  })

  const isDisabled = !actionData.account || !actionData.selectedFolderPath

  const handleSelectAccount = (account: IAccountState) => {
    setData({ account })
  }

  const handleBrowse = async () => {
    const result = await window.api.sendAsync('openDialog', { properties: ['openDirectory', 'createDirectory'] })
    setData({ selectedFolderPath: result[0] })
  }

  const handleExport = async () => {
    try {
      if (isDisabled) return

      const account = actionData.account!
      const service = bsAggregator.blockchainServicesByName[account.blockchain]

      const result = await service.blockchainDataService.exportFullTransactionsByAddress({
        address: account.address,
        dateFrom: actionData.from.toISOString(),
        dateTo: actionData.to.toISOString(),
      })

      const formattedDateFrom = dateFns.format(actionData.from, t('filenameDateFormat'))
      const formattedDateTo = dateFns.format(actionData.to, t('filenameDateFormat'))
      const filename = `NEON3-ACTV-${account.address}-${account.blockchain}-${formattedDateFrom}-${formattedDateTo}.csv`

      await window.api.sendAsync('saveFile', {
        path: `${actionData.selectedFolderPath}/${filename}`,
        content: result,
      })

      setData({ exported: true })
    } catch (error) {
      console.error(error)
      ToastHelper.error({ message: t('form.errorMessage') })
    }
  }

  const handleSelectDateFrom = (date: Date) => {
    setData({ from: date })

    if (actionData.to && dateFns.isAfter(date, actionData.to)) {
      setData({ to: dateFns.min([today, dateFns.add(date, { weeks: 1 })]) })
      return
    }

    if (actionData.to && dateFns.differenceInYears(actionData.to, date) > 0) {
      setData({ to: dateFns.add(date, { years: 1, days: -1 }) })
    }
  }

  const handleSelectDateTo = (date: Date) => {
    setData({ to: date })

    if (actionData.from && dateFns.isBefore(date, actionData.from)) {
      setData({ from: dateFns.sub(date, { weeks: 1 }) })
      return
    }

    if (actionData.from && dateFns.differenceInYears(date, actionData.from) > 0) {
      setData({ from: dateFns.sub(date, { years: 1, days: -1 }) })
    }
  }

  const handleReturn = () => {
    modalErase('center')
    navigate(`/app/wallets/${actionData.account!.id}/transactions`)
  }

  return (
    <CenterModalLayout
      heading={t('title')}
      headingIcon={<TbFileExport aria-hidden />}
      contentClassName="px-4 pt-4 overflow-auto"
    >
      {actionData.exported ? (
        <div className="flex flex-col items-center">
          <SuccessIcon className="mt-0" />

          <p className="text-lg text-white mt-8">{t('exported.description')}</p>

          <div className="mt-6 w-full flex flex-col items-center gap-2">
            <p className="text-gray-300 text-xs">{t('exported.selectedFolderPathInputLabel')}</p>
            <Input readOnly compacted value={actionData.selectedFolderPath} />
          </div>

          <div className="flex flex-col w-full">
            <p className="text-xs text-gray-100 uppercase font-bold mt-7">{t('exported.infoLabel')}</p>

            <ExportFullTransactionInfo
              account={actionData.account}
              today={today}
              readOnly
              from={actionData.from}
              to={actionData.to}
              onSelectAccount={handleSelectAccount}
              onSelectDateFrom={handleSelectDateFrom}
              onSelectDateTo={handleSelectDateTo}
            />
          </div>

          <Button
            className="mt-9"
            colorSchema="gray"
            wide
            label={t('exported.returnButtonLabel')}
            onClick={handleReturn}
            type="button"
          />
        </div>
      ) : (
        <div className="flex flex-col h-full">
          <p className="text-white text-xs">{t('form.description')}</p>

          <p className="text-xs text-gray-100 uppercase font-bold mt-7">{t('form.infoLabel')}</p>

          <form onSubmit={handleAct(handleExport)} className="flex flex-col flex-grow">
            <ExportFullTransactionInfo
              account={actionData.account}
              today={today}
              from={actionData.from}
              to={actionData.to}
              onSelectAccount={handleSelectAccount}
              onSelectDateFrom={handleSelectDateFrom}
              onSelectDateTo={handleSelectDateTo}
            />

            <div className="mt-7 flex items-end gap-2.5">
              <Input
                label={t('form.selectedFolderPathInputLabel')}
                compacted
                readOnly
                value={actionData.selectedFolderPath ?? ''}
              />
              <Button type="button" label={t('form.browseButtonLabel')} flat wide onClick={handleBrowse} />
            </div>

            <Button
              label={t('form.exportButtonLabel')}
              className="mt-auto w-48 mx-auto"
              leftIcon={<TbDeviceFloppy aria-hidden />}
              wide
              type="submit"
              loading={actionState.isActing}
              disabled={isDisabled}
              onClick={handleAct(handleExport)}
            />
          </form>
        </div>
      )}
    </CenterModalLayout>
  )
}
