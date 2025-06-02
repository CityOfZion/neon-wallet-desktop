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
              'z-[1010] flex items-center gap-2 rounded bg-gray-700 p-2 text-xs font-bold text-white shadow-lg',
              contentClassName
            )}
            {...contentProps}
          >
            {icon}
            {title}
            <RadixTooltip.Arrow className={StyleHelper.mergeStyles('fill-gray-700', arrowClassName)} {...arrowProps} />
          </RadixTooltip.Content>
        </RadixTooltip.Portal>
      </RadixTooltip.Root>
    </RadixTooltip.Provider>
  )
}
