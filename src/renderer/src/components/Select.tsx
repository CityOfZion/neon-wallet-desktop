import { ComponentPropsWithoutRef, ElementRef, forwardRef, Fragment } from 'react'

import * as SelectPrimitive from '@radix-ui/react-select'

import { StyleHelper } from '@renderer/helpers/StyleHelper'

import MdCheck from '@renderer/assets/images/md-check.svg?react'
import MdExpandLess from '@renderer/assets/images/md-expand-less.svg?react'
import MdExpandMore from '@renderer/assets/images/md-expand-more.svg?react'

const Root = SelectPrimitive.Root

const Value = SelectPrimitive.Value

const RawTrigger = SelectPrimitive.Trigger

const Trigger = forwardRef<
  ElementRef<typeof SelectPrimitive.Trigger>,
  ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>
>(({ className, children, disabled = false, ...props }, ref) => (
  <SelectPrimitive.Trigger
    ref={ref}
    aria-disabled={disabled}
    className={StyleHelper.mergeStyles(
      'group flex min-h-8.5 w-full min-w-46.5 items-center justify-between rounded-sm px-2.5 text-sm transition-colors [&>span]:truncate',
      'aria-disabled:cursor-not-allowed aria-disabled:opacity-50 aria-expanded:bg-gray-300/15 aria-[disabled=false]:hover:bg-gray-300/15',
      className
    )}
    disabled={disabled}
    {...props}
  >
    {children}
  </SelectPrimitive.Trigger>
))

const Icon = forwardRef<ElementRef<typeof SelectPrimitive.Icon>, ComponentPropsWithoutRef<typeof SelectPrimitive.Icon>>(
  ({ className, ...props }, ref) => (
    <SelectPrimitive.Icon
      ref={ref}
      className={StyleHelper.mergeStyles('max-h-6 min-h-6 max-w-6 min-w-6 text-white', className)}
      {...props}
    >
      <Fragment>
        <MdExpandMore aria-hidden className={StyleHelper.mergeStyles('h-full w-full group-aria-expanded:hidden')} />

        <MdExpandLess
          aria-hidden
          className={StyleHelper.mergeStyles('hidden h-full w-full group-aria-expanded:block')}
        />
      </Fragment>
    </SelectPrimitive.Icon>
  )
)

type TContentProps = ComponentPropsWithoutRef<typeof SelectPrimitive.Content> & {
  isTriggerWidth?: boolean
}

const Content = forwardRef<ElementRef<typeof SelectPrimitive.Content>, TContentProps>(
  ({ className, children, position = 'popper', align = 'center', isTriggerWidth = true, ...props }, ref) => (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        ref={ref}
        className={StyleHelper.mergeStyles(
          'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 relative z-1010 max-h-96 min-w-46.5 overflow-hidden rounded-sm bg-gray-900 text-white shadow-xl',
          {
            'data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1':
              position === 'popper',
          },
          className
        )}
        position={position}
        align={align}
        {...props}
      >
        <SelectPrimitive.Viewport
          className={StyleHelper.mergeStyles({
            'h-(--radix-select-trigger-height) w-full min-w-(--radix-select-trigger-width)': position === 'popper',
            'max-w-(--radix-select-trigger-width)': position === 'popper' && isTriggerWidth,
          })}
        >
          {children}
        </SelectPrimitive.Viewport>
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  )
)

const Item = forwardRef<ElementRef<typeof SelectPrimitive.Item>, ComponentPropsWithoutRef<typeof SelectPrimitive.Item>>(
  ({ className, children, ...props }, ref) => (
    <SelectPrimitive.Item
      ref={ref}
      className={StyleHelper.mergeStyles(
        'relative flex w-full min-w-0 cursor-pointer items-center justify-between gap-4 rounded-xs px-3 py-2 text-xs outline-hidden transition-colors select-none hover:bg-gray-800 focus:bg-gray-800 aria-disabled:cursor-default data-disabled:pointer-events-none data-disabled:opacity-50 [&>span]:truncate',
        className
      )}
      {...props}
    >
      {children}
    </SelectPrimitive.Item>
  )
)

const ItemIndicator = forwardRef<
  ElementRef<typeof SelectPrimitive.ItemIndicator>,
  ComponentPropsWithoutRef<typeof SelectPrimitive.ItemIndicator>
>((props, ref) => (
  <SelectPrimitive.ItemIndicator ref={ref} asChild {...props}>
    <MdCheck aria-hidden className="max-h-4 min-h-4 max-w-4 min-w-4" />
  </SelectPrimitive.ItemIndicator>
))

const ItemRadialIndicator = forwardRef<
  ElementRef<typeof SelectPrimitive.ItemIndicator>,
  ComponentPropsWithoutRef<typeof SelectPrimitive.ItemIndicator>
>((props, ref) => (
  <div className="group-data-[state=checked]:border-neon min-size-4 size-4 rounded-full border-2 bg-transparent outline-hidden group-data-[state=unchecked]:border-gray-300">
    <SelectPrimitive.ItemIndicator
      ref={ref}
      {...props}
      className={StyleHelper.mergeStyles(
        "after:bg-neon relative flex h-full w-full items-center justify-center after:block after:h-2 after:w-2 after:rounded-[50%] after:content-['']",
        props.className
      )}
    />
  </div>
))

const ItemText = forwardRef<
  ElementRef<typeof SelectPrimitive.ItemText>,
  ComponentPropsWithoutRef<typeof SelectPrimitive.ItemText>
>((props, ref) => <SelectPrimitive.ItemText ref={ref} {...props} />)

const Separator = forwardRef<
  ElementRef<typeof SelectPrimitive.Separator>,
  ComponentPropsWithoutRef<typeof SelectPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Separator
    ref={ref}
    className={StyleHelper.mergeStyles('-mx-1 h-px bg-gray-300/30', className)}
    {...props}
  />
))

export const Select = {
  Root,
  Content,
  Item,
  Icon,
  ItemText,
  ItemIndicator,
  Separator,
  Trigger,
  Value,
  RawTrigger,
  ItemRadialIndicator,
}
