import { cloneElement, ComponentProps } from 'react'
import { TbAlertTriangle } from 'react-icons/tb'
import { StyleHelper } from '@renderer/helpers/StyleHelper'

export type TAlertErrorBanner = {
  message: string | JSX.Element
  icon?: JSX.Element
}

type TProps = TAlertErrorBanner & ComponentProps<'div'>

export const AlertErrorBanner = ({ message, className, icon, ...props }: TProps) => {
  return (
    <div
      className={StyleHelper.mergeStyles(
        'bg-magenta-700 text-white rounded flex items-center px-5 py-2.5 gap-5 text-xs',
        className
      )}
      {...props}
    >
      {icon ? (
        cloneElement(icon, {
          className: StyleHelper.mergeStyles('text-magenta h-6 w-6', icon.props.className),
        })
      ) : (
        <TbAlertTriangle className="text-magenta h-6 w-6" />
      )}
      <span>{message}</span>
    </div>
  )
}
