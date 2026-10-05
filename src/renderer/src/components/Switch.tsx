import {
  ComponentProps,
  ComponentPropsWithoutRef,
  createContext,
  ElementRef,
  forwardRef,
  useContext,
  useId,
} from 'react'

import * as RadixSwitch from '@radix-ui/react-switch'

import { StyleHelper } from '@renderer/helpers/StyleHelper'

const SwitchContext = createContext<{ id?: string }>({})

type TRootProps = ComponentProps<'div'> & {
  id?: string
}

const Root = ({ id, className, ...props }: TRootProps) => {
  const generatedId = useId()

  return (
    <SwitchContext.Provider value={{ id: id || generatedId }}>
      <div className={StyleHelper.mergeStyles('flex items-center gap-x-1.5', className)} {...props} />
    </SwitchContext.Provider>
  )
}

const Control = forwardRef<ElementRef<typeof RadixSwitch.Root>, ComponentPropsWithoutRef<typeof RadixSwitch.Root>>(
  ({ className, ...props }, ref) => {
    const { id } = useContext(SwitchContext)

    return (
      <RadixSwitch.Root
        id={id}
        {...props}
        ref={ref}
        className={StyleHelper.mergeStyles(
          'bg-asphalt data-[state=checked]:bg-green relative box-content h-5 w-9 cursor-pointer rounded-full px-0.5 shadow-lg',
          className
        )}
      >
        <RadixSwitch.Thumb className="block h-4 w-4 translate-x-0 transform rounded-full bg-white shadow-lg transition-transform duration-100 will-change-transform data-[state=checked]:translate-x-5" />
      </RadixSwitch.Root>
    )
  }
)

const Label = ({ className, ...props }: ComponentProps<'label'>) => {
  const { id } = useContext(SwitchContext)

  return (
    <label
      htmlFor={id}
      {...props}
      className={StyleHelper.mergeStyles('cursor-pointer text-xs font-normal text-gray-100 select-none', className)}
    />
  )
}

export const Switch = { Root, Control, Label }
