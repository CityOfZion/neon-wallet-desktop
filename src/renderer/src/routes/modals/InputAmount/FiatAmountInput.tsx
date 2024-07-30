import { ChangeEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Input } from '@renderer/components/Input'
import { NumberHelper } from '@renderer/helpers/NumberHelper'
import { StringHelper } from '@renderer/helpers/StringHelper'
import { StyleHelper } from '@renderer/helpers/StyleHelper'
import { useCurrencySelector } from '@renderer/hooks/useSettingsSelector'
import { TTokenBalance } from '@shared/@types/query'

type TProps = {
  value: string
  onChange(event: ChangeEvent<HTMLInputElement>): void
  exchangeConvertedPrice: number
  tokenBalance: TTokenBalance
  error?: boolean
}

export const FiatAmountInput = ({ onChange, value, exchangeConvertedPrice, tokenBalance, error }: TProps) => {
  const { t } = useTranslation('modals', { keyPrefix: 'inputAmount' })
  const { currency } = useCurrencySelector()

  const valueNumber = NumberHelper.number(value)
  const estimatedToken = valueNumber > 0 && exchangeConvertedPrice > 0 ? valueNumber / exchangeConvertedPrice : 0
  const disabled = exchangeConvertedPrice === 0 || tokenBalance.token.decimals === 0

  return (
    <div
      className={StyleHelper.mergeStyles('w-full', {
        'opacity-50': disabled,
      })}
    >
      <label className="text-gray-100" htmlFor="fiatAmount">
        {t('enterAmount', { currencyType: currency.label })}
      </label>

      <Input
        onChange={onChange}
        value={value}
        placeholder={t('inputPlaceholder')}
        compacted
        className="w-full"
        containerClassName="mt-3.5"
        clearable={true}
        name="fiatAmount"
        disabled={disabled}
        error={error}
      />

      <div className="w-full flex justify-between mt-4 italic text-xs">
        <span className="text-gray-300">{t('tokenValue')}</span>
        <span className="text-gray-100 flex">
          {estimatedToken} {StringHelper.truncateString(tokenBalance.token.symbol, 4)}
        </span>
      </div>
    </div>
  )
}
