import React from 'react'
import * as RadixTooltip from '@radix-ui/react-tooltip'
import { StyleHelper } from '@renderer/helpers/StyleHelper'

type TProps = {
  children: React.ReactNode
  title: string
  icon?: React.ReactNode
  contentProps?: RadixTooltip.TooltipContentProps
  arrowProps?: RadixTooltip.TooltipArrowProps
  open?: boolean
  delayDuration?: number
}

export const Tooltip = ({ children, title, icon, open, delayDuration, ...props }: TProps) => {
  const { className: contentClassName, ...contentProps } = props.contentProps ?? {}
  const { className: arrowClassName, ...arrowProps } = props.arrowProps ?? {}

  if (!title) return children

  return (
    <RadixTooltip.Provider delayDuration={delayDuration}>
      <RadixTooltip.Root open={open} delayDuration={delayDuration}>
        <RadixTooltip.Trigger asChild>{children}</RadixTooltip.Trigger>
        <RadixTooltip.Portal>
          <RadixTooltip.Content
            side="bottom"
            className={StyleHelper.mergeStyles(
              'bg-gray-900/70 p-2 rounded text-xs text-white z-[1010] font-bold flex items-center gap-2',
              contentClassName
            )}
            {...contentProps}
          >
            {icon}
            {title}
            <RadixTooltip.Arrow
              className={StyleHelper.mergeStyles('fill-gray-900/70', arrowClassName)}
              {...arrowProps}
            />
          </RadixTooltip.Content>
        </RadixTooltip.Portal>
      </RadixTooltip.Root>
    </RadixTooltip.Provider>
  )
}
