import { Children, type ComponentProps, createContext, isValidElement, useContext, useId, useState } from 'react'

import * as TabsPrimitive from '@radix-ui/react-tabs'
import { AnimatePresence, motion } from 'motion/react'

import { StyleHelper } from '@renderer/helpers/StyleHelper'

const TabContext = createContext<TabsPrimitive.TabsProps | null>(null)

const useTabContext = () => {
  const context = useContext(TabContext)
  if (!context) {
    throw new Error('Tab compound components cannot be rendered outside the Tab.Root component')
  }

  return context
}

const Root = ({ value, className, id, ...props }: ComponentProps<typeof TabsPrimitive.Root>) => {
  const [internalValue, setInternalValue] = useState<string | undefined>(value)
  const internalId = useId()

  const handleChange = (value: string) => {
    setInternalValue(value)
    props.onValueChange?.(value)
  }

  const finalValue = value !== undefined ? value : internalValue

  return (
    <TabContext.Provider value={{ value: finalValue, id: id ?? internalId, ...props }}>
      <TabsPrimitive.Root
        data-slot="tabs-root"
        className={StyleHelper.mergeStyles('relative flex flex-col', className)}
        {...props}
        value={finalValue}
        onValueChange={handleChange}
      />
    </TabContext.Provider>
  )
}

const List = ({ className, children, ...props }: ComponentProps<typeof TabsPrimitive.List>) => (
  <TabsPrimitive.List
    data-slot="tabs-list"
    className={StyleHelper.mergeStyles('flex w-full items-center justify-center text-gray-300', className)}
    {...props}
  >
    <div className="flex h-fit w-fit border-b border-gray-300">{children}</div>
  </TabsPrimitive.List>
)

const Trigger = ({ className, value, ...props }: ComponentProps<typeof TabsPrimitive.Trigger>) => {
  const { value: activeValue, id } = useTabContext()
  const isActive = activeValue === value

  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      value={value}
      className={StyleHelper.mergeStyles(
        'text-1xs relative h-full justify-center px-4 py-3 font-medium whitespace-nowrap uppercase transition-colors focus-visible:outline-hidden disabled:pointer-events-none disabled:opacity-50 data-[state=active]:text-white',
        className
      )}
      {...props}
    >
      {props.children}
      {isActive && (
        <motion.div
          layoutId={`tab-indicator-${id}`}
          className="absolute right-0 bottom-0 left-0 h-0.5 bg-white"
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        />
      )}
    </TabsPrimitive.Trigger>
  )
}

type TContentProps = {
  children?: React.ReactNode
}

const Content = ({ children }: TContentProps) => {
  const { value: rootValue } = useTabContext()

  const activeChild = Children.toArray(children).find(
    child => isValidElement(child) && (child.props as any).value === rootValue
  ) as { props: ComponentProps<typeof TabsPrimitive.Content> }

  return (
    <AnimatePresence mode="wait" initial={false}>
      {isValidElement(activeChild) && (
        <motion.div
          className="w-full grow"
          key={rootValue}
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -10, opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <Item {...activeChild.props} />
        </motion.div>
      )}
    </AnimatePresence>
  )
}

const Item = ({ className, children, value, ...props }: ComponentProps<typeof TabsPrimitive.Content>) => {
  return (
    <TabsPrimitive.Content
      className={StyleHelper.mergeStyles(
        'ring-offset-background focus-visible:ring-ring flex h-full w-full grow flex-col items-center focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-hidden',
        className
      )}
      forceMount
      value={value}
      {...props}
    >
      {children}
    </TabsPrimitive.Content>
  )
}

export const Tabs = { List, Root, Trigger, Item, Content }
