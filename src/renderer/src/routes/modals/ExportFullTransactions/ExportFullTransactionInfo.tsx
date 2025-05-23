import { useTranslation } from 'react-i18next'
import { MdDateRange } from 'react-icons/md'
import { TbChevronRight, TbFileExport, TbPackages, TbWallet } from 'react-icons/tb'
import { ActionStep } from '@renderer/components/ActionStep'
import { BlockchainIcon } from '@renderer/components/BlockchainIcon'
import { Button } from '@renderer/components/Button'
import { DatePicker } from '@renderer/components/DatePicker'
import { Separator } from '@renderer/components/Separator'
import { useModalNavigate } from '@renderer/hooks/useModalRouter'
import { IAccountState } from '@shared/@types/store'
import * as dateFns from 'date-fns'

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

  const formattedDateFrom = dateFns.format(from, t('datePickerStepFormat'))
  const formattedDateTo = dateFns.format(to, t('datePickerStepFormat'))

  return (
    <div className="w-full flex flex-col gap-3 mt-2 relative">
      <div className="bg-gray-800  rounded w-full">
        <div className="flex flex-col items-center bg-gray-700/60 px-3.5 w-full rounded">
          <ActionStep
            title={
              readOnly ? (
                <p className="text-xs text-white px-2">{account ? account.address : t('addressPlaceholder')}</p>
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
                <BlockchainIcon blockchain={account.blockchain} type="blue" className="w-4 h-4" />
              ) : (
                <TbWallet aria-hidden />
              )
            }
            className="min-h-12"
            titleClassName="text-xs"
            leftIconContainerClassName="h-5 w-5"
          >
            {account && (
              <span className="text-gray-100 text-xs whitespace-nowrap">
                {commonT(`blockchain.${account.blockchain}`)}
              </span>
            )}
          </ActionStep>

          <Separator />

          <ActionStep
            title={
              <div className="flex items-center gap-1">
                {readOnly ? (
                  <p className="text-xs text-white px-2">{formattedDateFrom}</p>
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

                <TbChevronRight className="w-4 h-4 text-blue" aria-hidden />

                {readOnly ? (
                  <p className="text-xs text-white px-2">{formattedDateTo}</p>
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
  )
}
