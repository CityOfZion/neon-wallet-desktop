import { cloneElement, ComponentProps, type JSX } from 'react'

import { StyleHelper } from '@renderer/helpers/StyleHelper'

import TbAlertTriangle from '@renderer/assets/images/tb-alert-triangle.svg?react'

type TProps = ComponentProps<'div'> & {
  message: string | JSX.Element
  messageClassName?: string
  icon?: JSX.Element
  iconClassName?: string
}

export const AlertErrorBanner = ({ className, message, messageClassName, icon, iconClassName, ...props }: TProps) => {
  return (
    <div
      className={StyleHelper.mergeStyles(
        'bg-magenta-700 flex items-center gap-5 rounded-sm px-5 py-2.5 text-xs text-white',
        className
      )}
      {...props}
    >
      {icon ? (
        cloneElement(icon, {
          className: StyleHelper.mergeStyles('text-magenta size-6', icon.props.className),
        })
      ) : (
        <TbAlertTriangle
          aria-hidden
          className={StyleHelper.mergeStyles('text-magenta min-size-6 size-6', iconClassName)}
        />
      )}

      <span className={messageClassName}>{message}</span>
    </div>
  )
}
