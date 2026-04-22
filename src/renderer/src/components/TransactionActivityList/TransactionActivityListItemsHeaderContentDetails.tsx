import { cloneElement, ComponentProps, type JSX, ReactNode } from 'react'

import { ElementHelper } from '@renderer/helpers/ElementHelper'
import { StyleHelper } from '@renderer/helpers/StyleHelper'

import { TransactionActivityListTooltip } from './TransactionActivityListTooltip'

type TProps = {
  label?: string
  data: ReactNode
  icon: JSX.Element
} & ComponentProps<'div'>

export const TransactionActivityListItemsHeaderContentDetails = ({ label, data, icon, ...props }: TProps) => (
  <div {...props} className={StyleHelper.mergeStyles('flex items-center gap-x-1', props.className)}>
    {cloneElement(icon, {
      ...icon.props,
      className: StyleHelper.mergeStyles('text-gray-300 size-4 min-size-4 max-size-4', icon.props.className),
    })}

    {ElementHelper.isTextContentValid(data) ? (
      <TransactionActivityListTooltip data={label || ''}>
        <span className="text-white">{data}</span>
      </TransactionActivityListTooltip>
    ) : (
      data
    )}
  </div>
)
