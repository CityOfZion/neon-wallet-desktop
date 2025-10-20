import { useTranslation } from 'react-i18next'
import { BSBigNumberHelper, Token } from '@cityofzion/blockchain-service'
import { Checkbox } from '@renderer/components/Checkbox'
import { Skeleton } from '@renderer/components/Skeleton'
import { NumberHelper } from '@renderer/helpers/NumberHelper'
import { StyleHelper } from '@renderer/helpers/StyleHelper'
import { useCurrencySelector } from '@renderer/hooks/useSettingsSelector'

type TProps = {
  className?: string
  amountBn: BigNumber
  fiatPriceBn: BigNumber
  token: Token
  isChecked: boolean
  isDisabled: boolean
  isLoading: boolean
  onChange(isChecked: boolean): void
}

export const SendTip = ({
  className,
  amountBn,
  fiatPriceBn,
  token,
  isChecked,
  isDisabled,
  isLoading,
  onChange,
}: TProps) => {
  const { t } = useTranslation('pages', { keyPrefix: 'send.sendTip' })
  const { currency } = useCurrencySelector()

  const isInternalDisabled = isDisabled || isLoading

  return (
    <label
      aria-disabled={isInternalDisabled}
      className={StyleHelper.mergeStyles(
        'flex w-full cursor-pointer select-none items-center gap-x-3 rounded bg-green-700/50 px-3 py-4 text-xs font-medium text-neon aria-disabled:cursor-not-allowed',
        className
      )}
    >
      <Checkbox checked={isChecked} disabled={isInternalDisabled} onCheckedChange={onChange.bind(null, !isChecked)} />

      <span className="inline-block w-full">
        {t('supportLabel')}{' '}
        {isLoading ? (
          <Skeleton className="inline-block h-4 max-h-4 min-h-4 w-24 min-w-24 max-w-24 bg-gray-100 align-bottom" />
        ) : (
          <span className="uppercase">
            {BSBigNumberHelper.format(amountBn, { decimals: token.decimals })} {token.symbol} (
            {NumberHelper.currency(fiatPriceBn.toFixed(), currency.label, { maximumFractionDigits: 2 })}{' '}
            {currency.label})
          </span>
        )}{' '}
        <span className="italic text-gray-100">{t('optionalLabel')}</span>
      </span>
    </label>
  )
}
