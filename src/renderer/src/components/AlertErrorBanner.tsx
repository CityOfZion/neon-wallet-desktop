import { cloneElement, ComponentProps } from 'react'
import { TbAlertTriangle } from 'react-icons/tb'
import { StyleHelper } from '@renderer/helpers/StyleHelper'

export type TAlertErrorBanner = {
  message: string | JSX.Element
  messageClassName?: string
  icon?: JSX.Element
  iconClassName?: string
}

type TProps = TAlertErrorBanner & ComponentProps<'div'>

export const AlertErrorBanner = ({ className, message, messageClassName, icon, iconClassName, ...props }: TProps) => {
  return (
    <div
      className={StyleHelper.mergeStyles(
        'flex items-center gap-5 rounded bg-magenta-700 px-5 py-2.5 text-xs text-white',
        className
      )}
      {...props}
    >
      {icon ? (
        cloneElement(icon, {
          className: StyleHelper.mergeStyles('text-magenta h-6 w-6', icon.props.className),
        })
      ) : (
        <TbAlertTriangle
          aria-hidden={true}
          className={StyleHelper.mergeStyles('h-6 min-h-6 w-6 min-w-6 text-magenta', iconClassName)}
        />
      )}
      <span className={messageClassName}>{message}</span>
    </div>
  )
}
