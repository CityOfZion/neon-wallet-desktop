import { cloneElement, ComponentProps, type JSX } from 'react'

import { NavLink, useMatch } from 'react-router'

import { StyleHelper } from '@renderer/helpers/StyleHelper'

type Props = {
  icon: JSX.Element
  title: string
  to: string
  disabled?: boolean
} & ComponentProps<'a'>

export const SidebarLink = ({ icon, title, to, disabled, ...props }: Props): JSX.Element => {
  const handleClick: React.MouseEventHandler<HTMLAnchorElement> = event => {
    if (!disabled) return
    event.preventDefault()
  }

  const firstPath = to.split('/')[1]
  const match = useMatch(`/${firstPath}/*`)

  return (
    <li>
      <NavLink
        to={to}
        onClick={handleClick}
        aria-selected={!!match}
        className={StyleHelper.mergeStyles(
          'group text-1xs relative flex w-full flex-col items-center justify-center gap-1 py-2.5 text-white transition-colors',
          {
            'shadow-inner-md border-l-neon bg-asphalt border-l-3 pr-0.75': match,
            'cursor-not-allowed bg-transparent': !match && disabled,
            'hover:shadow-inner-md hover:border-l-neon hover:bg-asphalt cursor-pointer bg-transparent hover:border-l-3 hover:pr-0.75':
              !match && !disabled,
          }
        )}
        {...props}
      >
        {cloneElement(icon, {
          className: 'group-aria-selected:text-white text-gray-300 object-contain w-6 h-6',
        })}

        <span className="px-1 text-center leading-3">{title}</span>
      </NavLink>
    </li>
  )
}
