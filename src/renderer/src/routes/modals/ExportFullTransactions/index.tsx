import { hasFullTransactions } from '@cityofzion/blockchain-service'
import * as dateFns from 'date-fns'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'

import { Button } from '@renderer/components/Button'
import { Input } from '@renderer/components/Input'
import { SuccessIcon } from '@renderer/components/SuccessIcon'

import { BlockchainServiceHelper } from '@renderer/helpers/BlockchainServiceHelper'
import { DateHelper } from '@renderer/helpers/DateHelper'
import { ToastHelper } from '@renderer/helpers/ToastHelper'

import { useActions } from '@renderer/hooks/useActions'
import { useModalNavigate, useModalState } from '@renderer/hooks/useModalRouter'
import { useLanguageSelector } from '@renderer/hooks/useSettingsSelector'

import { CenterModalLayout } from '@renderer/layouts/CenterModal'

import TbDeviceFloppy from '@renderer/assets/images/tb-device-floppy.svg?react'
import TbExternalLink from '@renderer/assets/images/tb-external-link.svg?react'
import TbFileExport from '@renderer/assets/images/tb-file-export.svg?react'

import { AppError } from '@shared/helpers/SharedErrorHelper'
import type { TModalState } from '@shared/types/modal'
import { IAccountState } from '@shared/types/store'

import { ExportFullTransactionInfo } from './ExportFullTransactionInfo'

export type TExportFullTransactionsActionData = {
  account?: IAccountState
  to: Date
  from: Date
  selectedFolderPath?: string
  exported: boolean
  filePath: string
  isOpeningFilePath: boolean
}

const ExportFullTransactionsModal = () => {
  const { t } = useTranslation('modals', { keyPrefix: 'exportFullTransactions' })
  const { modalErase } = useModalNavigate()
  const navigate = useNavigate()
  const modalState = useModalState<TModalState<'export-full-transactions'>>()
  const { language } = useLanguageSelector()

  const today = new Date()
  const { dateFrom, dateTo } = modalState || {}

  const modalStateAccount = modalState?.account

  const { actionData, actionState, setData, handleAct } = useActions<TExportFullTransactionsActionData>({
    account: modalStateAccount,
    from: dateFrom ?? dateFns.startOfDay(dateFns.sub(today, { weeks: 1 })),
    to: dateTo ?? today,
    exported: false,
    selectedFolderPath: undefined,
    filePath: '',
    isOpeningFilePath: false,
  })

  const account = actionData.account
  const service = account
    ? BlockchainServiceHelper.bsAggregator.blockchainServicesByName[account.blockchain]
    : undefined

  const isDisabled = !account || !actionData.selectedFolderPath || !service || !hasFullTransactions(service)

  const handleSelectAccount = (account: IAccountState) => {
    setData({ account })
  }

  const handleBrowse = async () => {
    const result = await window.api.sendAsync('window:openDialog', { properties: ['openDirectory', 'createDirectory'] })
    setData({ selectedFolderPath: result[0] })
  }

  const handleExport = async () => {
    try {
      if (isDisabled) return

      const result = await service.fullTransactionsDataService.exportFullTransactionsByAddress({
        address: actionData.account!.address,
        dateFrom: actionData.from.toJSON(),
        dateTo: (dateFns.isSameDay(today, actionData.to) ? today : actionData.to).toJSON(),
      })

      const format = 'MMddyyyy'
      const formattedDateFrom = DateHelper.formatLocalized(actionData.from, {
        language,
        format,
      })
      const formattedDateTo = DateHelper.formatLocalized(actionData.to, {
        language,
        format,
      })
      const filename = `NEON3-ACTV-${account.address}-${account.blockchain}-${formattedDateFrom}-${formattedDateTo}.csv`
      const filePath = `${actionData.selectedFolderPath}/${filename}`

      await window.api.sendAsync('window:saveFile', {
        path: filePath,
        content: result,
      })

      setData({ exported: true, filePath })
    } catch (error) {
      console.error(error)
      ToastHelper.error({ message: AppError.wrap(error, t('form.errorMessage')).displayMessage })
    }
  }

  const handleSelectDateFrom = (date: Date) => {
    const from = dateFns.startOfDay(date)

    setData({ from })

    if (actionData.to && dateFns.isAfter(from, actionData.to)) {
      const to = dateFns.endOfDay(dateFns.min([today, dateFns.add(from, { weeks: 1 })]))

      setData({ to: dateFns.isSameDay(today, to) ? today : to })

      return
    }

    if (actionData.to && dateFns.differenceInYears(actionData.to, from) > 0) {
      const to = dateFns.endOfDay(dateFns.add(from, { years: 1, days: -1 }))

      setData({ to: dateFns.isSameDay(today, to) ? today : to })
    }
  }

  const handleSelectDateTo = (date: Date) => {
    const to = dateFns.isSameDay(today, date) ? today : dateFns.endOfDay(date)

    setData({ to })

    if (actionData.from && dateFns.isBefore(to, actionData.from)) {
      setData({ from: dateFns.startOfDay(dateFns.sub(to, { weeks: 1 })) })

      return
    }

    if (actionData.from && dateFns.differenceInYears(to, actionData.from) > 0) {
      setData({ from: dateFns.startOfDay(dateFns.sub(to, { years: 1, days: -1 })) })
    }
  }

  const handleReturn = () => {
    modalErase()
    navigate('/wallets/transactions', { state: { account: actionData.account } })
  }

  const handleOpenExport = async () => {
    if (!actionData.filePath || actionData.isOpeningFilePath) return

    setData({ isOpeningFilePath: true })

    try {
      await window.api.sendAsync('window:openFile', actionData.filePath)
    } catch (error) {
      console.error(error)
      ToastHelper.error({ message: AppError.wrap(error, t('messages.openExportError')).displayMessage, duration: 6000 })
    } finally {
      setData({ isOpeningFilePath: false })
    }
  }

  return (
    <CenterModalLayout
      heading={t('title')}
      headingIcon={<TbFileExport aria-hidden />}
      contentClassName="px-4 pt-4 overflow-auto"
    >
      {actionData.exported ? (
        <div className="flex flex-col items-center">
          <SuccessIcon aria-hidden className="mt-0" />

          <p className="mt-8 text-lg text-white">{t('exported.description')}</p>

          <div className="mt-6 flex w-full flex-col items-center gap-2">
            <p className="text-xs text-gray-300">{t('exported.selectedFolderPathInputLabel')}</p>
            <Input readOnly compacted value={actionData.selectedFolderPath} />
          </div>

          <div className="flex w-full flex-col">
            <p className="mt-7 text-xs font-bold text-gray-100 uppercase">{t('exported.infoLabel')}</p>

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

          <div className="mt-9 flex w-full items-center justify-center gap-x-3">
            <Button
              colorSchema="gray"
              className="w-48"
              label={t('exported.returnButtonLabel')}
              onClick={handleReturn}
              type="button"
            />

            {!!actionData.filePath && (
              <Button
                label={t('exported.openExportButtonLabel')}
                type="button"
                colorSchema="neon"
                className="w-48"
                wide
                loading={actionData.isOpeningFilePath}
                textClassName="grow-0"
                leftIcon={<TbExternalLink aria-hidden />}
                onClick={handleOpenExport}
              />
            )}
          </div>
        </div>
      ) : (
        <div className="flex h-full flex-col">
          <p className="text-xs text-white">{t('form.description')}</p>

          <p className="mt-7 text-xs font-bold text-gray-100 uppercase">{t('form.infoLabel')}</p>

          <form onSubmit={handleAct(handleExport)} className="flex grow flex-col">
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
              className="mx-auto mt-auto w-48"
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

export default ExportFullTransactionsModal
