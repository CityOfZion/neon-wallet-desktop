import React, { cloneElement, ComponentProps, type JSX } from 'react'

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
          'text-1xs relative flex w-full flex-col items-center justify-center gap-1 py-2.5 text-white transition-colors',
          {
            'cursor-not-allowed bg-transparent': disabled,
            'hover:shadow-inner-md hover:border-l-neon hover:bg-asphalt cursor-pointer bg-transparent hover:border-l-3 hover:pr-[0.188rem]':
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
