import { cloneElement, ComponentProps, ReactNode } from 'react'
import { StyleHelper } from '@renderer/helpers/StyleHelper'

import { TransactionActivityListTooltip } from './TransactionActivityListTooltip'

type TProps = {
  label?: string
  data: ReactNode
  icon: JSX.Element
} & ComponentProps<'div'>

export const TransactionActivityListItemHeaderDetails = ({ label, data, icon, ...props }: TProps) => (
  <div {...props} className={StyleHelper.mergeStyles('flex items-center gap-x-1', props.className)}>
    {cloneElement(icon, {
      ...icon.props,
      className: StyleHelper.mergeStyles('text-gray-300 w-4 min-w-4 max-w-4 h-4 min-h-4 max-h-4', icon.props.className),
    })}

    {typeof data === 'string' || typeof data === 'number' ? (
      <TransactionActivityListTooltip data={label ?? ''}>
        <span className="text-white">{data}</span>
      </TransactionActivityListTooltip>
    ) : (
      data
    )}
  </div>
)
