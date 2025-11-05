import { Fragment } from 'react'

import { StyleHelper } from '@renderer/helpers/StyleHelper'

export type TStepperCurrentState = 'success' | 'error'

type TProps = {
  steps: string[]
  currentStep?: number
  currentState?: TStepperCurrentState
  theme?: 'neon' | 'default'
  textClassName?: string
} & React.ComponentProps<'div'>

export const Stepper = ({
  steps,
  currentStep = 1,
  className,
  textClassName,
  theme = 'default',
  currentState = 'success',
  ...props
}: TProps) => {
  return (
    <div className={StyleHelper.mergeStyles('flex w-full items-center gap-x-1 px-6', className)} {...props}>
      {steps.map((step, index) => {
        const fixedIndex = index + 1
        const isCurrentStep = fixedIndex === currentStep
        const isCurrentOrFutureStep = fixedIndex >= currentStep
        const isPastStep = fixedIndex < currentStep
        const isFutureStep = fixedIndex > currentStep
        const isNeonTheme = theme === 'neon'
        const isDefaultTheme = theme === 'default'
        const isSuccessState = currentState === 'success'
        const isErrorState = currentState === 'error'

        return (
          <Fragment key={index}>
            <div className="relative flex flex-col">
              <span
                className={StyleHelper.mergeStyles(
                  'flex h-6 w-6 items-center justify-center rounded-full text-sm font-bold transition-colors',
                  {
                    'bg-blue text-asphalt': isPastStep && isDefaultTheme,
                    'bg-gray-900 text-gray-300': isFutureStep && isDefaultTheme,
                    'bg-neon text-asphalt': isPastStep && isNeonTheme,
                    'text-asphalt bg-gray-300': isFutureStep && isNeonTheme,
                    'text-asphalt bg-white': isCurrentStep && isSuccessState,
                    'bg-pink text-asphalt': isCurrentStep && isErrorState,
                  }
                )}
              >
                {fixedIndex}
              </span>

              <span
                className={StyleHelper.mergeStyles(
                  'absolute top-8 left-1/2 w-20 -translate-x-1/2 text-center text-xs transition-colors',
                  {
                    'text-blue': isPastStep && isDefaultTheme,
                    'text-neon': isPastStep && isNeonTheme,
                    'text-white': isCurrentStep && isSuccessState,
                    'text-pink': isCurrentStep && isErrorState,
                    'text-gray-300': isFutureStep,
                  },
                  textClassName
                )}
              >
                {step}
              </span>
            </div>

            {fixedIndex < steps.length && (
              <div
                className={StyleHelper.mergeStyles('h-0 w-full border-t-2 border-dashed transition-colors', {
                  'border-blue': isPastStep && isDefaultTheme,
                  'border-gray-900': isCurrentOrFutureStep && isDefaultTheme,
                  'border-neon': isPastStep && isNeonTheme,
                  'border-gray-300': isCurrentOrFutureStep && isNeonTheme,
                })}
              />
            )}
          </Fragment>
        )
      })}
    </div>
  )
}
