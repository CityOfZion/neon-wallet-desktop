import { cloneElement, ReactNode } from 'react'
import { StyleHelper } from '@renderer/helpers/StyleHelper'

type TAccountParams = {
  title: ReactNode
  disabled?: boolean
  leftIcon?: JSX.Element
  className?: string
  titleClassName?: string
  headerClassName?: string
  children?: ReactNode
}

export const ActionStep = ({
  title,
  disabled,
  leftIcon,
  className,
  titleClassName,
  headerClassName,
  children,
}: TAccountParams) => {
  return (
    <div className={StyleHelper.mergeStyles('flex justify-between items-center w-full min-h-14', className)}>
      <div
        className={StyleHelper.mergeStyles(
          'flex items-center gap-3',
          {
            'opacity-50': disabled,
          },
          headerClassName
        )}
      >
        {leftIcon && (
          <div className="w-5 h-5 flex items-center justify-center">
            {cloneElement(leftIcon, {
              ...leftIcon.props,
              className: StyleHelper.mergeStyles('text-blue w-full h-full', leftIcon.props.className),
            })}
          </div>
        )}

        <span className={StyleHelper.mergeStyles('text-sm', titleClassName)}>{title}</span>
      </div>

      {children}
    </div>
  )
}
