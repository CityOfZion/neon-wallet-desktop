import { cloneElement, ComponentProps, type JSX } from 'react'

import { NavLink } from 'react-router'

import { StyleHelper } from '@renderer/helpers/StyleHelper'

type TProps = {
  icon: JSX.Element
  title: string
  to: string
  colorSchema?: 'neon' | 'gray'
  disabled?: boolean
} & ComponentProps<'a'>

export const SettingsSidebarLink = ({
  icon,
  title,
  to,
  colorSchema = 'gray',
  disabled = false,
  ...props
}: TProps): JSX.Element => {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    if (disabled) {
      e.preventDefault()
    }
  }

  return (
    <li className="my-3">
      <NavLink
        to={to}
        className={({ isActive }) => `group ${isActive ? 'active' : ''}`}
        aria-disabled={disabled}
        onClick={handleClick}
        {...props}
      >
        <div
          className={StyleHelper.mergeStyles(
            'justify-content-end flex w-full gap-3 border-l-3 border-transparent px-3 py-2 transition-colors',
            'group-[.active]:border-neon group-[.active]:bg-asphalt group-hover:group-aria-[disabled=false]:border-neon group-hover:group-aria-[disabled=false]:bg-asphalt group-aria-[disabled=false]:cursor-pointer',
            'group-aria-disabled:cursor-default group-aria-disabled:opacity-50'
          )}
        >
          {cloneElement(icon, {
            className: StyleHelper.mergeStyles(
              'w-5 h-5 object-contain group-[.active]:text-neon group-hover:group-aria-[disabled=false]:text-neon transition-colors',
              {
                'text-neon': colorSchema === 'neon',
                'text-gray-300': colorSchema === 'gray',
              }
            ),
          })}

          <span
            className={StyleHelper.mergeStyles('leading-5 transition-colors', {
              'text-neon': colorSchema === 'neon',
              'text-gray-300 group-hover:group-aria-[disabled=false]:text-white group-[.active]:text-white':
                colorSchema === 'gray',
            })}
          >
            {title}
          </span>
        </div>
      </NavLink>
    </li>
  )
}
