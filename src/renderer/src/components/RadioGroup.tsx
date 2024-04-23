import { ComponentPropsWithoutRef, ElementRef, forwardRef } from 'react'
import * as RadixRadioGroup from '@radix-ui/react-radio-group'
import { StyleHelper } from '@renderer/helpers/StyleHelper'

const Group = forwardRef<
  ElementRef<typeof RadixRadioGroup.Root>,
  ComponentPropsWithoutRef<typeof RadixRadioGroup.Root>
>((props, ref) => {
  return <RadixRadioGroup.Root {...props} ref={ref} />
})

const Item = forwardRef<ElementRef<typeof RadixRadioGroup.Item>, ComponentPropsWithoutRef<typeof RadixRadioGroup.Item>>(
  (props, ref) => {
    return (
      <RadixRadioGroup.Item
        {...props}
        ref={ref}
        className={StyleHelper.mergeStyles(
          'px-4 hover:bg-asphalt border-b border-gray-300/30 bg-transparent outline-none cursor-pointer flex flex-row gap-y-2 gap-x-4 h-10 items-center justify-between w-full group',
          props.className
        )}
      />
    )
  }
)

const Indicator = forwardRef<
  ElementRef<typeof RadixRadioGroup.Indicator>,
  ComponentPropsWithoutRef<typeof RadixRadioGroup.Indicator>
>((props, ref) => {
  return (
    <div className="group-data-[state=unchecked]:border-gray-300 group-data-[state=checked]:border-neon border-2 bg-transparent w-4 h-4 rounded-full outline-none cursor-pointer">
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
