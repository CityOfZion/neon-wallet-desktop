import { forwardRef, PropsWithChildren } from 'react'
import { useTranslation } from 'react-i18next'
import { FieldActionsMenu } from '@renderer/components/FieldActionsMenu'
import { Loader } from '@renderer/components/Loader'
import { StyleHelper } from '@renderer/helpers/StyleHelper'

type TProps = PropsWithChildren<{
  value?: string
  onChange?: (value: string) => void
  disabled?: boolean
  readOnly?: boolean
  loading?: boolean
  className?: string
  inputClassName?: string
}>

export const GreyAmountInput = forwardRef<HTMLInputElement, TProps>(
  ({ onChange, value, disabled, loading, className, inputClassName, readOnly, children }, ref) => {
    const { t } = useTranslation('components', { keyPrefix: 'greyAmountInput' })
    const isDisabled = loading || disabled

    return (
      <div
        className={StyleHelper.mergeStyles(
          'flex h-8.5 w-36 items-center justify-center rounded bg-gray-300/15 text-sm aria-disabled:cursor-not-allowed aria-disabled:opacity-50',
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
                  'h-full w-full bg-transparent px-2 text-center text-neon outline-none [appearance:textfield] disabled:cursor-not-allowed',
                  inputClassName
                )}
                ref={ref}
                onChange={event => onChange?.(event.target.value)}
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
