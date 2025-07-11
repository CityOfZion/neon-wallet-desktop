import { ComponentPropsWithoutRef, ElementRef, forwardRef } from 'react'
import MdSearch from '@renderer/assets/images/md-search.svg?react'
import { StyleHelper } from '@renderer/helpers/StyleHelper'
import { Command as CommandPrimitive } from 'cmdk'

const Root = forwardRef<ElementRef<typeof CommandPrimitive>, ComponentPropsWithoutRef<typeof CommandPrimitive>>(
  ({ className, ...props }, ref) => (
    <CommandPrimitive
      ref={ref}
      className={StyleHelper.mergeStyles('flex h-full w-full flex-col overflow-hidden text-white', className)}
      {...props}
    />
  )
)

const Input = forwardRef<
  ElementRef<typeof CommandPrimitive.Input>,
  ComponentPropsWithoutRef<typeof CommandPrimitive.Input>
>(({ className, ...props }, ref) => (
  // eslint-disable-next-line react/no-unknown-property
  <div className="flex h-8.5 items-center rounded bg-asphalt px-2" cmdk-input-wrapper="">
    <MdSearch aria-hidden={true} className="mr-2 h-6 w-6 shrink-0 text-gray-300" />
    <CommandPrimitive.Input
      ref={ref}
      className={StyleHelper.mergeStyles(
        'flex h-full w-full bg-transparent text-sm outline-none placeholder:text-gray-300 disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
      {...props}
    />
  </div>
))

const List = forwardRef<
  ElementRef<typeof CommandPrimitive.List>,
  ComponentPropsWithoutRef<typeof CommandPrimitive.List>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.List
    ref={ref}
    className={StyleHelper.mergeStyles(
      'mt-0.5 max-h-96 overflow-y-auto overflow-x-hidden rounded bg-gray-900 [scrollbar-width:none]',
      className
    )}
    {...props}
  />
))

const Empty = forwardRef<
  ElementRef<typeof CommandPrimitive.Empty>,
  ComponentPropsWithoutRef<typeof CommandPrimitive.Empty>
>((props, ref) => <CommandPrimitive.Empty ref={ref} className="py-2.5 text-center text-xs text-gray-100" {...props} />)

const Group = forwardRef<
  ElementRef<typeof CommandPrimitive.Group>,
  ComponentPropsWithoutRef<typeof CommandPrimitive.Group>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Group
    ref={ref}
    className={StyleHelper.mergeStyles(
      'overflow-hidden text-white [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-gray-300',
      className
    )}
    {...props}
  />
))

const Item = forwardRef<
  ElementRef<typeof CommandPrimitive.Item>,
  ComponentPropsWithoutRef<typeof CommandPrimitive.Item>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Item
    ref={ref}
    className={StyleHelper.mergeStyles(
      "relative flex cursor-default select-none items-center px-2 text-sm outline-none data-[disabled=true]:pointer-events-none data-[selected='true']:bg-gray-800 data-[disabled=true]:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
      className
    )}
    {...props}
  />
))

export const Command = { Empty, Group, Input, Item, List, Root }
