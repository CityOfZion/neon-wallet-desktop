import { ReactNode } from 'react'

import { Tooltip } from '@renderer/components/Tooltip'

import { StyleHelper } from '@renderer/helpers/StyleHelper'

type TProps = {
  data: string | number
  children: ReactNode
  className?: string
}

export const TransactionActivityListTooltip = ({ data, className, children }: TProps) => (
  <Tooltip
    title={data.toString()}
    delayDuration={0}
    contentProps={{
      className: StyleHelper.mergeStyles('text-center inline-block max-w-44 wrap-break-word bg-gray-900', className),
    }}
    arrowProps={{ className: 'fill-gray-900' }}
  >
    {children}
  </Tooltip>
)
