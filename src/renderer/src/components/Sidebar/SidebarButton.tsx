import React, { cloneElement, ComponentProps } from 'react'
import { StyleHelper } from '@renderer/helpers/StyleHelper'

type Props = {
  icon: JSX.Element
  title: string
  disabled?: boolean
  onClick?: React.MouseEventHandler<HTMLButtonElement>
} & ComponentProps<'button'>

export const SidebarButton = ({ icon, title, onClick, disabled, ...props }: Props): JSX.Element => {
  return (
    <li>
      <button
        onClick={onClick}
        className={StyleHelper.mergeStyles(
          'text-white text-1xs flex flex-col justify-center items-center gap-1 py-2.5 w-full transition-colors relative',
          {
            'bg-transparent cursor-not-allowed': disabled,
            'bg-transparent cursor-pointer hover:border-l-neon hover:border-l-3 hover:pr-[0.188rem] hover:bg-asphalt hover:shadow-inner-md':
              !disabled,
          }
        )}
        {...props}
      >
        {cloneElement(icon, {
          className: 'stroke-gray-300 object-contain w-6 h-6',
        })}

        <span className="whitespace-nowrap">{title}</span>
      </button>
    </li>
  )
}
