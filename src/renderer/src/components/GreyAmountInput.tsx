import { forwardRef, ReactNode } from 'react'

import { useTranslation } from 'react-i18next'

import { StyleHelper } from '@renderer/helpers/StyleHelper'

import { Button, TButtonProps } from './Button'
import { Input, TInputProps } from './Input'

type TProps = {
  children?: ReactNode
  maxButtonProps?: TButtonProps
} & TInputProps

export const GreyAmountInput = forwardRef<HTMLInputElement, TProps>(
  ({ className, containerClassName, contentClassName, maxButtonProps, ...props }, ref) => {
    const { t } = useTranslation('components', { keyPrefix: 'greyAmountInput' })

    return (
      <Input
        ref={ref}
        className={className}
        containerClassName={StyleHelper.mergeStyles('w-36', containerClassName)}
        contentClassName={StyleHelper.mergeStyles('bg-gray-300/15 pr-0 pl-3 text-sm', contentClassName)}
        compacted
        disabled
        placeholder={t('placeholder')}
        rightElement={
          maxButtonProps ? (
            <Button
              {...maxButtonProps}
              label={t('maxButtonLabel')}
              flat
              colorSchema="neon"
              variant="card"
              disabled={props.disabled || maxButtonProps.disabled}
              className={StyleHelper.mergeStyles('w-12', maxButtonProps?.className)}
              clickableProps={{
                className: StyleHelper.mergeStyles(
                  'group-aria-[disabled=false]:bg-asphalt hover:group-aria-[disabled=false]:bg-asphalt/60 rounded-l-none',
                  maxButtonProps?.clickableProps?.className
                ),
                ...maxButtonProps?.clickableProps,
              }}
            />
          ) : undefined
        }
        {...props}
      />
    )
  }
)
