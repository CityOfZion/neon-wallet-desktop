import { ComponentPropsWithoutRef, ElementRef, forwardRef } from 'react'

import * as RadixRadioGroup from '@radix-ui/react-radio-group'

import { StyleHelper } from '@renderer/helpers/StyleHelper'

import { Separator } from './Separator'

const Group = forwardRef<
  ElementRef<typeof RadixRadioGroup.Root>,
  ComponentPropsWithoutRef<typeof RadixRadioGroup.Root>
>((props, ref) => {
  return <RadixRadioGroup.Root {...props} ref={ref} />
})

type ItemProps = ComponentPropsWithoutRef<typeof RadixRadioGroup.Item> & {
  separatorClassName?: string
  withSeparator?: boolean
}

const Item = forwardRef<ElementRef<typeof RadixRadioGroup.Item>, ItemProps>(
  ({ className, separatorClassName, withSeparator = true, children, ...props }, ref) => {
    return (
      <RadixRadioGroup.Item
        {...props}
        ref={ref}
        className={StyleHelper.mergeStyles('group flex h-10 w-full flex-col', className)}
      >
        <div className="hover:bg-asphalt flex h-full w-full cursor-pointer flex-row items-center justify-between gap-x-4 gap-y-2 bg-transparent px-5 outline-hidden">
          {children}
        </div>

        {withSeparator && (
          <div className={StyleHelper.mergeStyles('w-full px-4 group-last:hidden', separatorClassName)}>
            <Separator />
          </div>
        )}
      </RadixRadioGroup.Item>
    )
  }
)

const Indicator = forwardRef<
  ElementRef<typeof RadixRadioGroup.Indicator>,
  ComponentPropsWithoutRef<typeof RadixRadioGroup.Indicator>
>((props, ref) => {
  return (
    <div className="group-data-[state=checked]:border-neon h-4 min-h-4 w-4 min-w-4 cursor-pointer rounded-full border-2 bg-transparent outline-hidden group-data-[state=unchecked]:border-gray-300">
      <RadixRadioGroup.Indicator
        {...props}
        ref={ref}
        className={StyleHelper.mergeStyles(
          "after:bg-neon relative flex h-full w-full items-center justify-center after:block after:h-2 after:w-2 after:rounded-[50%] after:content-['']",
          props.className
        )}
      />
    </div>
  )
})

export const RadioGroup = { Group, Item, Indicator }
