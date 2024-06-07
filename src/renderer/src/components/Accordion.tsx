'use client'

import { ComponentPropsWithoutRef, ElementRef, forwardRef } from 'react'
import { MdExpandMore } from 'react-icons/md'
import * as AccordionPrimitive from '@radix-ui/react-accordion'
import { StyleHelper } from '@renderer/helpers/StyleHelper'

const Root = AccordionPrimitive.Root

const Item = forwardRef<
  ElementRef<typeof AccordionPrimitive.Item>,
  ComponentPropsWithoutRef<typeof AccordionPrimitive.Item>
>(({ className, ...props }, ref) => (
  <AccordionPrimitive.Item ref={ref} className={StyleHelper.mergeStyles('group', className)} {...props} />
))

const Trigger = forwardRef<
  ElementRef<typeof AccordionPrimitive.Trigger>,
  ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Header className="flex">
    <AccordionPrimitive.Trigger
      ref={ref}
      className={StyleHelper.mergeStyles(
        'flex flex-1 px-2.5 items-center justify-between py-2.5 border-b border-gray-100/50 text-sm font-medium transition-all group-last:border-b-0  [&[data-state=open]>svg]:rotate-180',
        className
      )}
      {...props}
    >
      {children}

      <MdExpandMore className="h-6 w-6 text-gray-100 shrink-0 text-muted-foreground transition-transform duration-200" />
    </AccordionPrimitive.Trigger>
  </AccordionPrimitive.Header>
))

const Content = forwardRef<
  ElementRef<typeof AccordionPrimitive.Content>,
  ComponentPropsWithoutRef<typeof AccordionPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Content
    ref={ref}
    className="overflow-hidden text-sm data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down"
    {...props}
  >
    <div className={StyleHelper.mergeStyles('pb-1.5 pt-0', className)}>{children}</div>
  </AccordionPrimitive.Content>
))

export const Accordion = { Root, Content, Item, Trigger }
