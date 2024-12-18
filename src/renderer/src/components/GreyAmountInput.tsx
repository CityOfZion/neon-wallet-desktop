import { ChangeEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Loader } from '@renderer/components/Loader'
import { StyleHelper } from '@renderer/helpers/StyleHelper'

type TProps = {
  value?: string
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void
  disabled?: boolean
  readOnly?: boolean
  loading?: boolean
  className?: string
}

export const GreyAmountInput = ({ onChange, value, disabled, loading, className, readOnly }: TProps) => {
  const { t } = useTranslation('components', { keyPrefix: 'greyAmountInput' })

  const isDisabled = loading || disabled
  return (
    <div
      className={StyleHelper.mergeStyles(
        'h-8.5 bg-gray-300/15 rounded w-32 aria-disabled:opacity-50 aria-disabled:cursor-not-allowed items-center justify-center flex text-sm',
        className
      )}
      aria-disabled={isDisabled}
    >
      {loading ? (
        <Loader />
      ) : (
        <input
          className="w-full h-full px-3.5 bg-transparent outline-none disabled:cursor-not-allowed [appearance:textfield] text-center"
          onChange={onChange}
          value={value}
          disabled={isDisabled}
          placeholder={t('placeholder')}
          readOnly={readOnly}
        />
      )}
    </div>
  )
}
