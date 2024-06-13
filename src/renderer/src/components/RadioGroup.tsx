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
  withSeparator?: boolean
}

const Item = forwardRef<ElementRef<typeof RadixRadioGroup.Item>, ItemProps>(
  ({ className, withSeparator = true, children, ...props }, ref) => {
    return (
      <RadixRadioGroup.Item
        {...props}
        ref={ref}
        className={StyleHelper.mergeStyles('flex flex-col w-full h-10 group', className)}
      >
        <div className="px-5 hover:bg-asphalt bg-transparent outline-none cursor-pointer flex flex-row gap-y-2 gap-x-4  items-center justify-between w-full h-full">
          {children}
        </div>

        {withSeparator && (
          <div className="w-full px-4 group-last:hidden">
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
    <div className="group-data-[state=unchecked]:border-gray-300 group-data-[state=checked]:border-neon border-2 bg-transparent min-w-[1rem] min-h-[1rem] w-[1rem] h-[1rem] rounded-full outline-none cursor-pointer">
      <RadixRadioGroup.Indicator
        {...props}
        ref={ref}
        className={StyleHelper.mergeStyles(
          "flex items-center justify-center w-full h-full relative after:content-[''] after:block after:w-2 after:h-2 after:rounded-[50%] after:bg-neon",
          props.className
        )}
      />
    </div>
  )
})

export const RadioGroup = { Group, Item, Indicator }
