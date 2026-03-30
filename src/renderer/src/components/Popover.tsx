import { ComponentPropsWithoutRef, ElementRef, forwardRef } from 'react'

import * as PopoverPrimitive from '@radix-ui/react-popover'

import { StyleHelper } from '@renderer/helpers/StyleHelper'

const Root = PopoverPrimitive.Root

const Trigger = PopoverPrimitive.Trigger

export type TPopoverContentProps = ComponentPropsWithoutRef<typeof PopoverPrimitive.Content>

const Content = forwardRef<ElementRef<typeof PopoverPrimitive.Content>, TPopoverContentProps>(
  ({ className, align = 'center', sideOffset = 4, ...props }, ref) => (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        ref={ref}
        align={align}
        sideOffset={sideOffset}
        className={StyleHelper.mergeStyles(
          'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-1010 w-(--radix-popper-anchor-width) min-w-48 overflow-hidden rounded-sm bg-gray-900 shadow-md outline-hidden',
          className
        )}
        {...props}
      />
    </PopoverPrimitive.Portal>
  )
)

export const Popover = { Root, Content, Trigger }
