import { useTranslation } from 'react-i18next'

import { ActionStep } from '@renderer/components/ActionStep'
import { BlockchainIcon } from '@renderer/components/BlockchainIcon'
import { Button } from '@renderer/components/Button'
import { DatePicker } from '@renderer/components/DatePicker'
import { Separator } from '@renderer/components/Separator'

import { DateHelper } from '@renderer/helpers/DateHelper'

import { useModalNavigate } from '@renderer/hooks/useModalRouter'
import { useLanguageSelector } from '@renderer/hooks/useSettingsSelector'

import MdDateRange from '@renderer/assets/images/md-date-range.svg?react'
import TbChevronRight from '@renderer/assets/images/tb-chevron-right.svg?react'
import TbFileExport from '@renderer/assets/images/tb-file-export.svg?react'
import TbPackages from '@renderer/assets/images/tb-packages.svg?react'
import TbWallet from '@renderer/assets/images/tb-wallet.svg?react'

import { IAccountState } from '@shared/types/store'

type TProps = {
  account?: IAccountState
  from: Date
  to: Date
  today: Date
  onSelectAccount: (account: IAccountState) => void
  onSelectDateFrom: (date: Date) => void
  onSelectDateTo: (date: Date) => void
  readOnly?: boolean
}

export const ExportFullTransactionInfo = ({
  account,
  from,
  to,
  today,
  onSelectAccount,
  onSelectDateFrom,
  onSelectDateTo,
  readOnly,
}: TProps) => {
  const { t } = useTranslation('modals', { keyPrefix: 'exportFullTransactions.info' })
  const { t: commonT } = useTranslation('common')
  const { modalNavigateWrapper } = useModalNavigate()
  const { language } = useLanguageSelector()

  const formattedDateFrom = DateHelper.formatLocalized(from, {
    format: 'P',
    language,
  })
  const formattedDateTo = DateHelper.formatLocalized(to, {
    format: 'P',
    language,
  })

  return (
    <div className="relative mt-2 flex w-full flex-col gap-3">
      <div className="w-full rounded-sm bg-gray-800">
        <div className="flex w-full flex-col items-center rounded-sm bg-gray-700/60 px-3.5">
          <ActionStep
            title={
              readOnly ? (
                <p className="px-2 text-xs text-white">{account ? account.address : t('addressPlaceholder')}</p>
              ) : (
                <Button
                  className="min-w-0"
                  colorSchema="neon"
                  label={account ? account.address : t('addressPlaceholder')}
                  textClassName="text-xs text-left"
                  variant="text"
                  flat
                  type="button"
                  onClick={modalNavigateWrapper('select-account', {
                    state: { onSelectAccount, leftIcon: <TbFileExport aria-hidden /> },
                  })}
                />
              )
            }
            leftIcon={
              account ? (
                <BlockchainIcon blockchain={account.blockchain} type="blue" className="h-4 w-4" />
              ) : (
                <TbWallet aria-hidden />
              )
            }
            titleClassName="text-xs"
            leftIconContainerClassName="h-5 w-5"
          >
            {account && (
              <span className="text-xs whitespace-nowrap text-gray-100">
                {commonT(`blockchain.${account.blockchain}`)}
              </span>
            )}
          </ActionStep>

          <Separator />

          <ActionStep
            title={
              <div className="flex items-center gap-1">
                {readOnly ? (
                  <p className="px-2 text-xs text-white">{formattedDateFrom}</p>
                ) : (
                  <DatePicker.Root>
                    <DatePicker.Trigger asChild>
                      <Button label={formattedDateFrom} flat variant="text" colorSchema="neon" type="button" />
                    </DatePicker.Trigger>

                    <DatePicker.Picker
                      autoFocus
                      mode="single"
                      disabled={{
                        after: today,
                      }}
                      required
                      defaultMonth={from}
                      selected={from}
                      onSelect={onSelectDateFrom}
                      popoverContentProps={{ align: 'start' }}
                    />
                  </DatePicker.Root>
                )}

                <TbChevronRight className="text-blue h-4 w-4" aria-hidden />

                {readOnly ? (
                  <p className="px-2 text-xs text-white">{formattedDateTo}</p>
                ) : (
                  <DatePicker.Root>
                    <DatePicker.Trigger asChild>
                      <Button label={formattedDateTo} flat variant="text" colorSchema="neon" type="button" />
                    </DatePicker.Trigger>

                    <DatePicker.Picker
                      numberOfMonths={1}
                      autoFocus
                      required
                      mode="single"
                      disabled={{
                        after: today,
                      }}
                      defaultMonth={to}
                      selected={to}
                      onSelect={onSelectDateTo}
                      popoverContentProps={{ align: 'start' }}
                    />
                  </DatePicker.Root>
                )}
              </div>
            }
            className="min-h-12"
            leftIcon={<MdDateRange aria-hidden />}
            titleClassName="text-xs"
            leftIconContainerClassName="h-5 w-5"
          >
            {!readOnly && <span className="text-right text-xs text-gray-300">{t('datePickerStepTip')}</span>}
          </ActionStep>

          <Separator />

          <ActionStep
            title={t('allTransactionsStepLabel')}
            leftIcon={<TbPackages aria-hidden />}
            headerClassName="gap-5"
            titleClassName="text-xs"
            leftIconContainerClassName="h-5 w-5"
          />
        </div>
      </div>
    </div>
  )
}
