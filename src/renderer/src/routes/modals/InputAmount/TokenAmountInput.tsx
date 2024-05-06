import { ChangeEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@renderer/components/Button'
import { Input } from '@renderer/components/Input'
import { NumberHelper } from '@renderer/helpers/NumberHelper'
import { StyleHelper } from '@renderer/helpers/StyleHelper'
import { useCurrencySelector } from '@renderer/hooks/useSettingsSelector'

type TProps = {
  value: string
  onChange(event: ChangeEvent<HTMLInputElement>): void
  onMaxClick(): void
  exchangeRatio: number
  error?: boolean
}

export const TokenAmountInput = ({ onChange, onMaxClick, value, exchangeRatio, error }: TProps) => {
  const { t } = useTranslation('modals', { keyPrefix: 'inputAmount' })
  const { currency } = useCurrencySelector()

  const estimatedFiat = NumberHelper.number(value) * exchangeRatio

  return (
    <div className="mt-6 w-full">
      <label className="block w-full text-gray-100 text-left text-sm" htmlFor="tokenAmount">
        {t('enterTokenAmount')}
      </label>

      <div className="w-full flex mt-3.5">
        <Input
          onChange={onChange}
          value={value}
          placeholder={t('inputPlaceholder')}
          compacted
          className="w-full mx-auto rounded-e-none"
          clearable={true}
          name="tokenAmount"
          error={error}
        />
        <Button
          clickableProps={{
            className: 'rounded-l-none px-5',
          }}
          onClick={onMaxClick}
          colorSchema="gray"
          flat={true}
          type="button"
          label={t('max')}
        />
      </div>

      <div
        className={StyleHelper.mergeStyles('w-full flex justify-between gap-4 mt-4.5 italic text-xs', {
          'opacity-50': exchangeRatio === 0,
        })}
      >
        <span className="text-gray-300 whitespace-nowrap">{t('fiatValue', { currencyType: currency.label })}</span>
        <span className="text-gray-100 whitespace-nowrap truncate">
          {NumberHelper.currency(estimatedFiat, currency.label)}
        </span>
      </div>
    </div>
  )
}
