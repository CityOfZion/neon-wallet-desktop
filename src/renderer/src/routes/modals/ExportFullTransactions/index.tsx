import { useTranslation } from 'react-i18next'
import { MdDateRange } from 'react-icons/md'
import { TbChevronRight, TbDeviceFloppy, TbFileExport, TbPackages } from 'react-icons/tb'
import { ActionStep } from '@renderer/components/ActionStep'
import { BlockchainIcon } from '@renderer/components/BlockchainIcon'
import { Button } from '@renderer/components/Button'
import { DatePicker } from '@renderer/components/DatePicker'
import { Input } from '@renderer/components/Input'
import { Separator } from '@renderer/components/Separator'
import { DateHelper } from '@renderer/helpers/DateHelper'
import { ToastHelper } from '@renderer/helpers/ToastHelper'
import { useActions } from '@renderer/hooks/useActions'
import { useModalNavigate, useModalState } from '@renderer/hooks/useModalRouter'
import { CenterModalLayout } from '@renderer/layouts/CenterModal'
import { bsAggregator } from '@renderer/libs/blockchainService'
import { IAccountState } from '@shared/@types/store'
import { add, differenceInYears, format, isAfter, isBefore, sub } from 'date-fns'

type TModalState = {
  account: IAccountState
  to: Date
  from: Date
}

type TActionData = {
  account: IAccountState
  to: Date
  from: Date
  selectedFolderPath?: string
}

export const ExportFullTransactionsModal = () => {
  const modalState = useModalState<TModalState>()
  const { modalNavigateWrapper } = useModalNavigate()
  const { t } = useTranslation('modals', { keyPrefix: 'exportFullTransactions' })
  const { t: commonT } = useTranslation('common')

  const today = new Date()

  const { actionData, actionState, setData, handleAct } = useActions<TActionData>({
    account: modalState.account,
    from: modalState.from ?? sub(today, { weeks: 1 }),
    to: modalState.to ?? today,
  })

  const isDisabled = !actionData.selectedFolderPath

  const handleSelectAccount = (account: IAccountState) => {
    setData({ account })
  }

  const handleBrowse = async () => {
    const result = await window.api.sendAsync('openDialog', { properties: ['openDirectory', 'createDirectory'] })
    setData({ selectedFolderPath: result[0] })
  }

  const handleExport = async () => {
    try {
      if (isDisabled) {
        return
      }

      const service = bsAggregator.blockchainServicesByName[actionData.account.blockchain]

      const result = await service.blockchainDataService.exportFullTransactionsByAddress({
        address: actionData.account.address,
        dateFrom: actionData.from.toISOString(),
        dateTo: actionData.to.toISOString(),
      })

      await window.api.sendAsync('saveFile', {
        path: `${actionData.selectedFolderPath}/export-${DateHelper.getNowUnix()}.csv`,
        content: result,
      })

      ToastHelper.success({ message: t('successfullyMessage') })
    } catch (error) {
      console.error(error)
      ToastHelper.error({ message: t('errorMessage') })
    }
  }

  const handleSelectDateFrom = (date: Date) => {
    setData({ from: date })

    if (actionData.to && isAfter(date, actionData.to)) {
      setData({ to: sub(date, { weeks: 1 }) })
      return
    }

    if (actionData.to && differenceInYears(actionData.to, date) > 0) {
      setData({ to: add(date, { years: 1, days: -1 }) })
    }
  }

  const handleSelectDateTo = (date: Date) => {
    setData({ to: date })

    if (actionData.from && isBefore(date, actionData.from)) {
      setData({ from: sub(date, { weeks: 1 }) })
      return
    }

    if (actionData.from && differenceInYears(date, actionData.from) > 0) {
      setData({ from: sub(date, { years: 1, days: -1 }) })
    }
  }

  return (
    <CenterModalLayout
      heading={t('title')}
      headingIcon={<TbFileExport aria-hidden />}
      contentClassName="px-4 pt-6 flex flex-col"
    >
      <p className="text-white text-xs">{t('description')}</p>

      <p className="text-xs text-gray-100 uppercase font-bold mt-7">{t('formLabel')}</p>

      <form onSubmit={handleAct(handleExport)} className="flex flex-col flex-grow">
        <div className="w-full flex flex-col gap-3 mt-2 relative">
          <div className="bg-gray-800  rounded w-full">
            <div className="flex flex-col items-center bg-gray-700/60 px-3.5 w-full rounded">
              <ActionStep
                title={
                  <Button
                    className="min-w-0"
                    colorSchema="neon"
                    label={actionData.account.address}
                    textClassName="text-xs text-left"
                    variant="text"
                    flat
                    onClick={modalNavigateWrapper('select-account', {
                      state: { onSelectAccount: handleSelectAccount, leftIcon: <TbFileExport aria-hidden /> },
                    })}
                  />
                }
                leftIcon={<BlockchainIcon blockchain={actionData.account.blockchain} type="blue" className="w-4 h-4" />}
                className="min-h-12"
                titleClassName="text-xs"
                leftIconContainerClassName="h-5 w-5"
              >
                <span className="text-gray-100 text-xs whitespace-nowrap">
                  {commonT(`blockchain.${actionData.account.blockchain}`)}
                </span>
              </ActionStep>

              <Separator />

              <ActionStep
                title={
                  <div className="flex items-center gap-1">
                    <DatePicker.Root>
                      <DatePicker.Trigger asChild>
                        <Button
                          label={
                            actionData.from
                              ? format(actionData.from, t('datePickerStepFormat'))
                              : commonT('general.emptyColumn')
                          }
                          flat
                          variant="text"
                          colorSchema="neon"
                        />
                      </DatePicker.Trigger>

                      <DatePicker.Picker
                        autoFocus
                        mode="single"
                        disabled={{
                          after: today,
                        }}
                        required
                        defaultMonth={actionData.from}
                        selected={actionData.from}
                        onSelect={handleSelectDateFrom}
                        popoverContentProps={{ align: 'start' }}
                      />
                    </DatePicker.Root>

                    <TbChevronRight className="w-4 h-4 text-blue" aria-hidden />

                    <DatePicker.Root>
                      <DatePicker.Trigger asChild>
                        <Button
                          label={
                            actionData.to
                              ? format(actionData.to, t('datePickerStepFormat'))
                              : commonT('general.emptyColumn')
                          }
                          flat
                          variant="text"
                          colorSchema="neon"
                        />
                      </DatePicker.Trigger>

                      <DatePicker.Picker
                        numberOfMonths={1}
                        autoFocus
                        required
                        mode="single"
                        disabled={{
                          after: today,
                        }}
                        defaultMonth={actionData.to}
                        selected={actionData.to}
                        onSelect={handleSelectDateTo}
                        popoverContentProps={{ align: 'start' }}
                      />
                    </DatePicker.Root>
                  </div>
                }
                className="min-h-12"
                leftIcon={<MdDateRange aria-hidden />}
                titleClassName="text-xs"
                leftIconContainerClassName="h-5 w-5"
              >
                <span className="text-xs text-gray-300">{t('datePickerStepTip')}</span>
              </ActionStep>

              <Separator />

              <ActionStep
                title={t('allTransactionsStepLabel')}
                leftIcon={<TbPackages aria-hidden />}
                headerClassName="gap-5"
                className="min-h-12"
                titleClassName="text-xs"
                leftIconContainerClassName="h-5 w-5"
              />
            </div>
          </div>
        </div>

        <div className="mt-7 flex items-end gap-2.5">
          <Input
            label={t('selectedFolderPathInputLabel')}
            compacted
            readOnly
            value={actionData.selectedFolderPath ?? ''}
          />
          <Button type="button" label={t('browseButtonLabel')} flat wide onClick={handleBrowse} />
        </div>

        <Button
          label={t('exportButtonLabel')}
          className="mt-auto w-48 mx-auto"
          leftIcon={<TbDeviceFloppy aria-hidden />}
          wide
          type="submit"
          loading={actionState.isActing}
          disabled={isDisabled}
          onClick={handleAct(handleExport)}
        />
      </form>
    </CenterModalLayout>
  )
}
