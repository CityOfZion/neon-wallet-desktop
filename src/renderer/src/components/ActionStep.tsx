import { cloneElement, ReactNode } from 'react'
import { StyleHelper } from '@renderer/helpers/StyleHelper'

type TAccountParams = {
  title: string
  disabled?: boolean
  leftIcon?: JSX.Element
  className?: string
  children?: ReactNode
}

export const ActionStep = ({ title, disabled, leftIcon, className, children }: TAccountParams) => {
  return (
    <div className={StyleHelper.mergeStyles('flex justify-between w-full px-3.5 py-1.5 min-h-10', className)}>
      <div
        className={StyleHelper.mergeStyles('flex items-center gap-3', {
          'opacity-50': disabled,
        })}
      >
        {leftIcon && (
          <div className="w-5 h-5 flex items-center justify-center">
            {cloneElement(leftIcon, {
              ...leftIcon.props,
              className: StyleHelper.mergeStyles('text-blue w-full h-full', leftIcon.props.className),
            })}
          </div>
        )}

        <span className="text-sm">{title}</span>
      </div>

      {children}
    </div>
  )
}
