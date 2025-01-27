import React, { ComponentPropsWithoutRef, ElementRef, forwardRef } from 'react'
import { TbCheck, TbChevronRight, TbCircleFilled } from 'react-icons/tb'
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

const Group = ContextMenuPrimitive.Group

const Portal = ContextMenuPrimitive.Portal

const Sub = ContextMenuPrimitive.Sub

const RadioGroup = ContextMenuPrimitive.RadioGroup

const SubTrigger = forwardRef<
  ElementRef<typeof ContextMenuPrimitive.SubTrigger>,
  ComponentPropsWithoutRef<typeof ContextMenuPrimitive.SubTrigger> & { inset?: boolean }
>(({ className, inset, children, ...props }, ref) => (
  <ContextMenuPrimitive.SubTrigger
    ref={ref}
    className={StyleHelper.mergeStyles(
      'flex cursor-pointer text-white select-none items-center rounded-sm px-2 py-1.5 text-xs outline-none transition-colors hover:bg-neon/10 focus:bg-neon/10 data-[state=open]:bg-neon/10',
      {
        'pl-8': inset,
      },
      className
    )}
    {...props}
  >
    {children} <TbChevronRight aria-hidden={true} className="ml-auto h-4 w-4" />
  </ContextMenuPrimitive.SubTrigger>
))

SubTrigger.displayName = ContextMenuPrimitive.SubTrigger.displayName

const SubContent = forwardRef<
  ElementRef<typeof ContextMenuPrimitive.SubContent>,
  ComponentPropsWithoutRef<typeof ContextMenuPrimitive.SubContent>
>(({ className, ...props }, ref) => (
  <ContextMenuPrimitive.SubContent
    ref={ref}
    className={StyleHelper.mergeStyles(
      'z-[1012] min-w-[10rem] border-t-3 border-neon overflow-hidden rounded-md bg-asphalt p-1 shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
      className
    )}
    {...props}
  />
))

SubContent.displayName = ContextMenuPrimitive.SubContent.displayName

const Content = forwardRef<
  ElementRef<typeof ContextMenuPrimitive.Content>,
  ComponentPropsWithoutRef<typeof ContextMenuPrimitive.Content>
>(({ className, ...props }, ref) => (
  <ContextMenuPrimitive.Portal>
    <ContextMenuPrimitive.Content
      ref={ref}
      className={StyleHelper.mergeStyles(
        'z-[1012] min-w-[10rem] border-t-3 border-neon overflow-hidden rounded-md bg-asphalt p-1 shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
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
      'relative text-white transition-colors hover:bg-neon/10 focus:bg-neon/10 flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-xs outline-none data-[disabled]:cursor-default data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
      { 'pl-8': inset },
      className
    )}
    {...props}
  />
))

Item.displayName = ContextMenuPrimitive.Item.displayName

const CheckboxItem = forwardRef<
  ElementRef<typeof ContextMenuPrimitive.CheckboxItem>,
  ComponentPropsWithoutRef<typeof ContextMenuPrimitive.CheckboxItem>
>(({ className, children, checked, ...props }, ref) => (
  <ContextMenuPrimitive.CheckboxItem
    ref={ref}
    className={StyleHelper.mergeStyles(
      'relative text-white transition-colors hover:bg-neon/10 focus:bg-neon/10 flex cursor-pointer select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-xs outline-none data-[disabled]:cursor-default data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
      className
    )}
    checked={checked}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <ContextMenuPrimitive.ItemIndicator>
        <TbCheck aria-hidden={true} className="h-4 w-4" />
      </ContextMenuPrimitive.ItemIndicator>
    </span>

    {children}
  </ContextMenuPrimitive.CheckboxItem>
))

CheckboxItem.displayName = ContextMenuPrimitive.CheckboxItem.displayName

const RadioItem = forwardRef<
  ElementRef<typeof ContextMenuPrimitive.RadioItem>,
  ComponentPropsWithoutRef<typeof ContextMenuPrimitive.RadioItem>
>(({ className, children, ...props }, ref) => (
  <ContextMenuPrimitive.RadioItem
    ref={ref}
    className={StyleHelper.mergeStyles(
      'relative text-white transition-colors hover:bg-neon/10 focus:bg-neon/10 flex cursor-pointer select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-xs outline-none data-[disabled]:cursor-default data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
      className
    )}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <ContextMenuPrimitive.ItemIndicator>
        <TbCircleFilled aria-hidden={true} className="h-2 w-2 fill-current" />
      </ContextMenuPrimitive.ItemIndicator>
    </span>

    {children}
  </ContextMenuPrimitive.RadioItem>
))

RadioItem.displayName = ContextMenuPrimitive.RadioItem.displayName

const Label = forwardRef<
  ElementRef<typeof ContextMenuPrimitive.Label>,
  ComponentPropsWithoutRef<typeof ContextMenuPrimitive.Label> & { inset?: boolean }
>(({ className, inset, ...props }, ref) => (
  <ContextMenuPrimitive.Label
    ref={ref}
    className={StyleHelper.mergeStyles('px-2 py-1.5 text-xs font-bold text-white', { 'pl-8': inset }, className)}
    {...props}
  />
))

Label.displayName = ContextMenuPrimitive.Label.displayName

const Separator = forwardRef<
  ElementRef<typeof ContextMenuPrimitive.Separator>,
  ComponentPropsWithoutRef<typeof ContextMenuPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <ContextMenuPrimitive.Separator
    ref={ref}
    className={StyleHelper.mergeStyles('-mx-1 my-1 h-px bg-gray-800', className)}
    {...props}
  />
))

Separator.displayName = ContextMenuPrimitive.Separator.displayName

const Shortcut = ({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) => (
  <span className={StyleHelper.mergeStyles('ml-auto text-1xs tracking-widest', className)} {...props} />
)

Shortcut.displayName = 'Shortcut'

export const ContextMenu = {
  CheckboxItem,
  Content,
  Group,
  Item,
  Label,
  Portal,
  RadioGroup,
  RadioItem,
  Root,
  Separator,
  Shortcut,
  Sub,
  SubContent,
  SubTrigger,
  Trigger,
}
