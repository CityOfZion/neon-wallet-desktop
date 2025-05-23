import { useTranslation } from 'react-i18next'
import { MdCalendarMonth, MdChevronRight } from 'react-icons/md'
import { Button } from '@renderer/components/Button'
import { DatePicker } from '@renderer/components/DatePicker'
import { format } from 'date-fns'

type TProps = {
  dateFrom: Date
  dateTo: Date
  isDisabled: boolean | { after: Date }
  onSelectDateFrom: (dateFrom: Date) => void
  onSelectDateTo: (dateTo: Date) => void
}

export const TransactionActivityListDateRange = ({
  dateFrom,
  dateTo,
  isDisabled,
  onSelectDateFrom,
  onSelectDateTo,
}: TProps) => {
  const { t } = useTranslation('components', { keyPrefix: 'transactionActivityList.dateRange' })

  return (
    <div className="flex items-center justify-center gap-x-0.5 px-2 bg-asphalt w-56 min-w-56 max-w-56 h-9 rounded">
      <MdCalendarMonth aria-hidden={true} className="h-3 min-h-3 max-h-3 w-3 min-w-3 max-w-3 text-gray-100 mr-0.5" />

      <DatePicker.Root>
        <DatePicker.Trigger asChild>
          <Button
            label={format(dateFrom, t('formatExtendedDate'))}
            type="button"
            flat
            variant="text"
            colorSchema="neon"
            clickableProps={{ className: 'h-6 min-h-6 max-h-6' }}
          />
        </DatePicker.Trigger>

        <DatePicker.Picker
          mode="single"
          selected={dateFrom}
          defaultMonth={dateFrom}
          required={true}
          disabled={isDisabled}
          onSelect={onSelectDateFrom}
        />
      </DatePicker.Root>

      <MdChevronRight aria-hidden={true} className="h-4 min-h-4 max-h-4 w-4 min-w-4 max-w-4 text-gray-100" />

      <DatePicker.Root>
        <DatePicker.Trigger asChild>
          <Button
            label={format(dateTo, t('formatExtendedDate'))}
            type="button"
            flat
            variant="text"
            colorSchema="neon"
            clickableProps={{ className: 'h-6 min-h-6 max-h-6' }}
          />
        </DatePicker.Trigger>

        <DatePicker.Picker
          mode="single"
          selected={dateTo}
          defaultMonth={dateTo}
          required={true}
          disabled={isDisabled}
          onSelect={onSelectDateTo}
        />
      </DatePicker.Root>
    </div>
  )
}
