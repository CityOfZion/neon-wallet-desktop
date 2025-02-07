import { forwardRef, PropsWithChildren } from 'react'
import { useTranslation } from 'react-i18next'
import { FieldActionsMenu } from '@renderer/components/FieldActionsMenu'
import { Loader } from '@renderer/components/Loader'
import { StyleHelper } from '@renderer/helpers/StyleHelper'

type TProps = PropsWithChildren<{
  value?: string
  onChange?: (value: string) => void
  onClick?: () => void
  disabled?: boolean
  readOnly?: boolean
  loading?: boolean
  className?: string
  inputClassName?: string
}>

export const GreyAmountInput = forwardRef<HTMLInputElement, TProps>(
  ({ onChange, onClick, value, disabled, loading, className, inputClassName, readOnly, children }, ref) => {
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
            <FieldActionsMenu value={value ?? ''} disabled={isDisabled} readOnly={readOnly} onChange={onChange}>
              <input
                className={StyleHelper.mergeStyles(
                  'w-full h-full px-2 bg-transparent outline-none disabled:cursor-not-allowed [appearance:textfield] text-neon text-center',
                  inputClassName
                )}
                ref={ref}
                onChange={event => onChange?.(event.target.value)}
                onClick={onClick}
                value={value}
                disabled={isDisabled}
                placeholder={t('placeholder')}
                readOnly={readOnly}
              />
            </FieldActionsMenu>

            {children}
          </>
        )}
      </div>
    )
  }
)
