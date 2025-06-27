import { useTranslation } from 'react-i18next'
import { MdLaunch } from 'react-icons/md'
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
  filePath: string
  isOpeningFilePath: boolean
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
    filePath: '',
    isOpeningFilePath: false,
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
      const filePath = `${actionData.selectedFolderPath}/${filename}`

      await window.api.sendAsync('saveFile', {
        path: filePath,
        content: result,
      })

      setData({ exported: true, filePath })
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

  const handleOpenExport = async () => {
    if (!actionData.filePath || actionData.isOpeningFilePath) return

    setData({ isOpeningFilePath: true })

    try {
      await window.api.sendAsync('openFile', actionData.filePath)
    } catch (error) {
      console.error(error)
      ToastHelper.error({ message: t('messages.openExportError'), duration: 6000 })
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
          <SuccessIcon className="mt-0" />

          <p className="mt-8 text-lg text-white">{t('exported.description')}</p>

          <div className="mt-6 flex w-full flex-col items-center gap-2">
            <p className="text-xs text-gray-300">{t('exported.selectedFolderPathInputLabel')}</p>
            <Input readOnly compacted value={actionData.selectedFolderPath} />
          </div>

          <div className="flex w-full flex-col">
            <p className="mt-7 text-xs font-bold uppercase text-gray-100">{t('exported.infoLabel')}</p>

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
                textClassName="flex-grow-0"
                leftIcon={<MdLaunch aria-hidden={true} />}
                onClick={handleOpenExport}
              />
            )}
          </div>
        </div>
      ) : (
        <div className="flex h-full flex-col">
          <p className="text-xs text-white">{t('form.description')}</p>

          <p className="mt-7 text-xs font-bold uppercase text-gray-100">{t('form.infoLabel')}</p>

          <form onSubmit={handleAct(handleExport)} className="flex flex-grow flex-col">
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
