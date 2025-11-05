import { ComponentPropsWithoutRef, ElementRef, forwardRef } from 'react'

import * as TabsPrimitive from '@radix-ui/react-tabs'

import { StyleHelper } from '@renderer/helpers/StyleHelper'

const Root = TabsPrimitive.Root

const List = forwardRef<ElementRef<typeof TabsPrimitive.List>, ComponentPropsWithoutRef<typeof TabsPrimitive.List>>(
  ({ className, children, ...props }, ref) => (
    <TabsPrimitive.List
      ref={ref}
      className={StyleHelper.mergeStyles('flex w-full items-center justify-center text-gray-300', className)}
      {...props}
    >
      <div className="flex h-fit w-fit border-b border-gray-300">{children}</div>
    </TabsPrimitive.List>
  )
)

const Trigger = forwardRef<
  ElementRef<typeof TabsPrimitive.Trigger>,
  ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={StyleHelper.mergeStyles(
      'text-1xs h-full justify-center border-b-2 border-transparent px-4 py-3 whitespace-nowrap uppercase transition-all focus-visible:outline-hidden disabled:pointer-events-none disabled:opacity-50 data-[state=active]:border-white data-[state=active]:text-white',
      className
    )}
    {...props}
  />
))

const Content = forwardRef<
  ElementRef<typeof TabsPrimitive.Content>,
  ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={StyleHelper.mergeStyles(
      'ring-offset-background focus-visible:ring-ring mt-2 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-hidden',
      className
    )}
    {...props}
  />
))

export const Tabs = { Content, List, Root, Trigger }
