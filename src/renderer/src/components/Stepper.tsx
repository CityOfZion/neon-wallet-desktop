import {
  Children,
  cloneElement,
  type ComponentProps,
  createContext,
  isValidElement,
  type ReactElement,
  useContext,
  useId,
} from 'react'

import { AnimatePresence, motion } from 'motion/react'
import { useTranslation } from 'react-i18next'

import { StyleHelper } from '@renderer/helpers/StyleHelper'

export type TStepperState = 'success' | 'error'

type TRootProps = {
  value: number
  state?: TStepperState
  colorSchema?: 'neon' | 'default'
  id?: string
}

const StepperContext = createContext<Required<TRootProps> | null>(null)

const useStepperContext = () => {
  const context = useContext(StepperContext)
  if (!context) {
    throw new Error('Stepper compound components cannot be rendered outside the Stepper.Root component')
  }

  return context
}

const Root = ({
  className,
  colorSchema = 'default',
  state = 'success',
  value,
  id,
  ...props
}: ComponentProps<'div'> & TRootProps) => {
  const { t } = useTranslation('components', { keyPrefix: 'stepper' })
  const stepperId = useId()

  return (
    <StepperContext.Provider value={{ colorSchema, value, state, id: id || stepperId }}>
      <div
        data-slot="stepper-root"
        role="group"
        aria-label={t('rootLabel')}
        className={StyleHelper.mergeStyles('flex flex-col', className)}
        {...props}
      />
    </StepperContext.Provider>
  )
}

const List = ({ className, children, ...props }: ComponentProps<'div'>) => {
  const { t } = useTranslation('components', { keyPrefix: 'stepper' })
  const stepperContext = useStepperContext()

  const validatedChildren = Children.toArray(children).filter((child): child is ReactElement<TStepProps> => {
    return isValidElement(child) && child.type === Step
  })

  if (validatedChildren.length !== Children.toArray(children).length) {
    throw new Error('Stepper.List only accepts Stepper.Step as children')
  }

  return (
    <div
      data-slot="stepper-list"
      aria-label={t('listLabel')}
      className={StyleHelper.mergeStyles('flex w-full items-center gap-x-1 px-6', className)}
      {...props}
    >
      <ol role="list" className="flex w-full items-center gap-x-1">
        {validatedChildren.map((child, index) => {
          const fixedIndex = index + 1
          return cloneElement(child, {
            'data-index': fixedIndex,
            'data-status':
              fixedIndex < stepperContext.value ? 'past' : fixedIndex === stepperContext.value ? 'current' : 'future',
            'data-state': stepperContext.state,
            'data-color-schema': stepperContext.colorSchema,
            'aria-current': fixedIndex === stepperContext.value ? 'step' : undefined,
          } as any)
        })}
      </ol>
    </div>
  )
}

type TStepProps = {
  label: string
  value: TRootProps['value']
} & ComponentProps<'li'>

const Step = ({ label, value, ...props }: TStepProps) => {
  const stepperContext = useStepperContext()

  return (
    <li
      key={value}
      data-value={value}
      data-slot={`stepper-step-${value}`}
      className="group flex w-full items-center last:w-auto"
      {...props}
    >
      <div className="relative flex flex-col">
        <span
          role="status"
          className={StyleHelper.mergeStyles(
            'flex h-6 w-6 items-center justify-center rounded-full text-sm font-bold transition-colors',
            'group-data-[status=past]:group-data-[color-schema=default]:bg-blue group-data-[status=past]:group-data-[color-schema=default]:text-asphalt group-data-[status=past]:group-data-[color-schema=neon]:bg-neon group-data-[status=past]:group-data-[color-schema=neon]:text-asphalt',
            'group-data-[status=future]:group-data-[color-schema=neon]:text-asphalt group-data-[status=future]:group-data-[color-schema=default]:bg-gray-900 group-data-[status=future]:group-data-[color-schema=default]:text-gray-300 group-data-[status=future]:group-data-[color-schema=neon]:bg-gray-300',
            'group-data-[status=current]:group-data-[state=success]:text-asphalt group-data-[status=current]:group-data-[state=error]:bg-pink group-data-[status=current]:group-data-[state=error]:text-asphalt group-data-[status=current]:group-data-[state=success]:bg-white'
          )}
        >
          {value}
        </span>

        <span
          id={`${stepperContext.id}-step-${value}-label`}
          className={StyleHelper.mergeStyles(
            'absolute top-8 left-1/2 w-20 -translate-x-1/2 text-center text-xs transition-colors',
            'group-data-[status=past]:group-data-[color-schema=default]:text-blue group-data-[status=past]:group-data-[color-schema=neon]:text-neon',
            'group-data-[status=current]:group-data-[state=error]:text-pink group-data-[status=current]:group-data-[state=success]:text-white',
            'group-data-[status=future]:text-gray-300'
          )}
        >
          {label}
        </span>
      </div>

      <div
        aria-hidden="true"
        className={StyleHelper.mergeStyles(
          'h-0 w-full border-t-2 border-dashed transition-colors group-last:hidden',
          'group-data-[status=past]:group-data-[color-schema=default]:border-blue group-data-[status=past]:group-data-[color-schema=neon]:border-neon',
          'group-data-[color-schema=default]:border-gray-900 group-data-[color-schema=neon]:border-gray-300'
        )}
      />
    </li>
  )
}

const Content = ({ className, children, ...props }: ComponentProps<'div'>) => {
  const stepperContext = useStepperContext()

  const validatedChildren = Children.toArray(children).filter((child): child is ReactElement<TItemProps> => {
    return isValidElement(child) && child.type === Item
  })

  if (validatedChildren.length !== Children.toArray(children).length) {
    throw new Error('Stepper.Content only accepts Stepper.Item as children')
  }

  const activeChild = validatedChildren.find(child => child.props.value === stepperContext.value)

  return (
    <div
      role="region"
      aria-live="polite"
      aria-atomic="true"
      aria-labelledby={`${stepperContext.id}-step-${stepperContext.value}-label`}
      className={StyleHelper.mergeStyles('flex min-h-0 w-full grow flex-col', className)}
      {...props}
    >
      <AnimatePresence mode="wait" initial={false}>
        {activeChild && (
          <motion.div
            key={stepperContext.value}
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -10, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="flex w-full grow flex-col"
          >
            <Item {...activeChild.props} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

type TItemProps = {
  value: TRootProps['value']
} & ComponentProps<'div'>

const Item = ({ value, className, ...props }: TItemProps) => {
  return (
    <div
      data-slot="stepper-item"
      key={value}
      className={StyleHelper.mergeStyles('flex w-full grow flex-col', className)}
      {...props}
    />
  )
}

export const Stepper = { Root, List, Step, Content, Item }
