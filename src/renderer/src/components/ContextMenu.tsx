import { ComponentPropsWithoutRef, ElementRef, forwardRef } from 'react'

import * as ContextMenuPrimitive from '@radix-ui/react-context-menu'

import { StyleHelper } from '@renderer/helpers/StyleHelper'
const Root = ContextMenuPrimitive.Root

const Trigger = forwardRef<
  ElementRef<typeof ContextMenuPrimitive.Trigger>,
  ComponentPropsWithoutRef<typeof ContextMenuPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <ContextMenuPrimitive.Trigger ref={ref} className={StyleHelper.mergeStyles('flex w-full', className)} {...props}>
    {children}
  </ContextMenuPrimitive.Trigger>
))

const Portal = ContextMenuPrimitive.Portal

const Content = forwardRef<
  ElementRef<typeof ContextMenuPrimitive.Content>,
  ComponentPropsWithoutRef<typeof ContextMenuPrimitive.Content>
>(({ className, ...props }, ref) => (
  <ContextMenuPrimitive.Portal>
    <ContextMenuPrimitive.Content
      ref={ref}
      className={StyleHelper.mergeStyles(
        'border-neon bg-asphalt data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-1012 min-w-40 overflow-hidden rounded-md border-t-3 p-1 shadow-md',
        className
      )}
      {...props}
    />
  </ContextMenuPrimitive.Portal>
))

Content.displayName = ContextMenuPrimitive.Content.displayName

const Item = forwardRef<
  ElementRef<typeof ContextMenuPrimitive.Item>,
  ComponentPropsWithoutRef<typeof ContextMenuPrimitive.Item> & { inset?: boolean }
>(({ className, inset, ...props }, ref) => (
  <ContextMenuPrimitive.Item
    ref={ref}
    className={StyleHelper.mergeStyles(
      'hover:bg-neon/10 focus:bg-neon/10 relative flex cursor-pointer items-center rounded-xs px-2 py-1.5 text-xs text-white outline-hidden transition-colors select-none data-disabled:pointer-events-none data-disabled:cursor-default data-disabled:opacity-50',
      { 'pl-8': inset },
      className
    )}
    {...props}
  />
))

Item.displayName = ContextMenuPrimitive.Item.displayName

export const ContextMenu = {
  Content,
  Item,
  Portal,
  Root,
  Trigger,
}
