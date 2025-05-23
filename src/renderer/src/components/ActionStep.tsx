import { cloneElement, ReactNode } from 'react'
import { StyleHelper } from '@renderer/helpers/StyleHelper'

type TAccountParams = {
  title: ReactNode
  disabled?: boolean
  leftIcon?: JSX.Element
  leftIconContainerClassName?: string
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
  leftIconContainerClassName,
  children,
}: TAccountParams) => {
  return (
    <div className={StyleHelper.mergeStyles('flex justify-between items-center w-full min-h-14 gap-3', className)}>
      <div
        className={StyleHelper.mergeStyles(
          'flex items-center gap-3 flex-grow min-w-0',
          {
            'opacity-50': disabled,
          },
          headerClassName
        )}
      >
        {leftIcon && (
          <div
            className={StyleHelper.mergeStyles('w-5 h-5 flex items-center justify-center', leftIconContainerClassName)}
          >
            {cloneElement(leftIcon, {
              ...leftIcon.props,
              className: StyleHelper.mergeStyles('text-blue w-full h-full', leftIcon.props.className),
            })}
          </div>
        )}

        {typeof title === 'string' ? (
          <span className={StyleHelper.mergeStyles('text-sm text-white truncate', titleClassName)}>{title}</span>
        ) : (
          title
        )}
      </div>

      {children}
    </div>
  )
}
