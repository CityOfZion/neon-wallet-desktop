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
    <div className={StyleHelper.mergeStyles('flex min-h-14 w-full items-center justify-between gap-3', className)}>
      <div
        className={StyleHelper.mergeStyles(
          'flex min-w-0 flex-grow items-center gap-3',
          {
            'opacity-50': disabled,
          },
          headerClassName
        )}
      >
        {leftIcon && (
          <div
            className={StyleHelper.mergeStyles('flex h-5 w-5 items-center justify-center', leftIconContainerClassName)}
          >
            {cloneElement(leftIcon, {
              ...leftIcon.props,
              className: StyleHelper.mergeStyles('text-blue w-full h-full', leftIcon.props.className),
            })}
          </div>
        )}

        {typeof title === 'string' ? (
          <span className={StyleHelper.mergeStyles('truncate text-sm text-white', titleClassName)}>{title}</span>
        ) : (
          title
        )}
      </div>

      {children}
    </div>
  )
}
