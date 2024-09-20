import { cloneElement, ComponentProps } from 'react'
import { StyleHelper } from '@renderer/helpers/StyleHelper'

type TProps = {
  message: string | JSX.Element
  icon?: JSX.Element
} & ComponentProps<'div'>

export const AlertSuccessBanner = ({ message, className, icon, ...props }: TProps) => {
  return (
    <div
      className={StyleHelper.mergeStyles(
        'bg-green-700 text-white rounded flex items-center px-5 py-2.5 gap-5 text-xs',
        className
      )}
      {...props}
    >
      {icon &&
        cloneElement(icon, {
          ...icon.props,
          className: StyleHelper.mergeStyles('text-neon h-6 w-6', icon.props.className),
        })}
      <span>{message}</span>
    </div>
  )
}
