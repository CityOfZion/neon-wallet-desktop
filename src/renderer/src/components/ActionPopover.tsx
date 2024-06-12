import { ComponentProps, ComponentPropsWithoutRef, ElementRef, forwardRef } from 'react'
import * as RadixPopover from '@radix-ui/react-popover'
import { StyleHelper } from '@renderer/helpers/StyleHelper'

import { Button } from './Button'
import { Separator } from './Separator'

const Root = RadixPopover.Root

const Trigger = RadixPopover.Trigger

const Content = forwardRef<
  ElementRef<typeof RadixPopover.Content>,
  ComponentPropsWithoutRef<typeof RadixPopover.Content>
>(({ className, side = 'right', children, ...props }, ref) => (
  <RadixPopover.Portal>
    <RadixPopover.Content
      ref={ref}
      className={StyleHelper.mergeStyles('relative group', className)}
      side={side}
      align="center"
      sideOffset={32}
      {...props}
    >
      <div
        className={StyleHelper.mergeStyles('bg-gray-900 flex flex-col rounded  overflow-hidden', {
          'border-r-4 border-r-neon': side === 'right',
          'border-l-4 border-l-neon': side === 'left',
        })}
      >
        {children}
      </div>

      <div
        className={StyleHelper.mergeStyles('flex items-center absolute top-2/4 -translate-y-2/4 ', {
          'right-0 translate-x-full flex-row-reverse': side === 'right',
          'left-0 -translate-x-full flex-row': side === 'left',
        })}
      >
        <div className="w-2 h-2 bg-neon rounded-full" />

        <div className="w-5 h-px bg-neon" />
      </div>
    </RadixPopover.Content>
  </RadixPopover.Portal>
))

const Item = ({ clickableProps, ...props }: ComponentProps<typeof Button>) => (
  <Button
    clickableProps={{ className: 'rounded-none h-10 px-4 justify-start', ...clickableProps }}
    className="w-full"
    variant="text"
    flat
    {...props}
  />
)

export const ActionPopover = {
  Root,
  Trigger,
  Content,
  Item,
  Separator,
}
