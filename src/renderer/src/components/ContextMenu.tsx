import { ComponentPropsWithoutRef, ComponentRef, forwardRef } from 'react'

import * as ContextMenuPrimitive from '@radix-ui/react-context-menu'

import { StyleHelper } from '@renderer/helpers/StyleHelper'

import { Button } from './Button'

const Root = ContextMenuPrimitive.Root

const Trigger = forwardRef<
  ComponentRef<typeof ContextMenuPrimitive.Trigger>,
  ComponentPropsWithoutRef<typeof ContextMenuPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <ContextMenuPrimitive.Trigger ref={ref} className={StyleHelper.mergeStyles('flex w-full', className)} {...props}>
    {children}
  </ContextMenuPrimitive.Trigger>
))

const Portal = ContextMenuPrimitive.Portal

const Content = forwardRef<
  ComponentRef<typeof ContextMenuPrimitive.Content>,
  ComponentPropsWithoutRef<typeof ContextMenuPrimitive.Content>
>(({ className, ...props }, ref) => (
  <ContextMenuPrimitive.Portal>
    <ContextMenuPrimitive.Content
      ref={ref}
      className={StyleHelper.mergeStyles(
        'border-neon data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-2012 flex min-w-20 flex-col overflow-hidden rounded-sm border-t-3 bg-gray-900/50 shadow-md backdrop-blur-md',
        className
      )}
      {...props}
    />
  </ContextMenuPrimitive.Portal>
))

Content.displayName = ContextMenuPrimitive.Content.displayName

const Item = forwardRef<ComponentRef<typeof ContextMenuPrimitive.Item>, ComponentPropsWithoutRef<typeof Button>>(
  (props, ref) => (
    <ContextMenuPrimitive.Item ref={ref} asChild>
      <Button
        variant="text"
        flat
        colorSchema="white"
        clickableProps={{ className: 'rounded-none h-10 px-4 justify-start gap-3' }}
        {...props}
      />
    </ContextMenuPrimitive.Item>
  )
)

Item.displayName = ContextMenuPrimitive.Item.displayName

export const ContextMenu = {
  Content,
  Item,
  Portal,
  Root,
  Trigger,
}
