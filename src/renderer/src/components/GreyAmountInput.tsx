import { ChangeEvent, PropsWithChildren } from 'react'
import { useTranslation } from 'react-i18next'
import { Loader } from '@renderer/components/Loader'
import { StyleHelper } from '@renderer/helpers/StyleHelper'

type TProps = PropsWithChildren<{
  value?: string
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void
  disabled?: boolean
  readOnly?: boolean
  loading?: boolean
  className?: string
  inputClassName?: string
}>

export const GreyAmountInput = ({
  onChange,
  value,
  disabled,
  loading,
  className,
  inputClassName,
  readOnly,
  children,
}: TProps) => {
  const { t } = useTranslation('components', { keyPrefix: 'greyAmountInput' })
  const isDisabled = loading || disabled

  return (
    <div
      className={StyleHelper.mergeStyles(
        'h-8.5 bg-gray-300/15 rounded w-36 aria-disabled:opacity-50 aria-disabled:cursor-not-allowed items-center justify-center flex text-sm',
        className
      )}
      aria-disabled={isDisabled}
    >
      {loading ? (
        <Loader />
      ) : (
        <>
          <input
            className={StyleHelper.mergeStyles(
              'w-full h-full px-2 bg-transparent outline-none disabled:cursor-not-allowed [appearance:textfield] text-neon text-center',
              inputClassName
            )}
            onChange={onChange}
            value={value}
            disabled={isDisabled}
            placeholder={t('placeholder')}
            readOnly={readOnly}
          />

          {children}
        </>
      )}
    </div>
  )
}
