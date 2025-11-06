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
          "before:absolute before:left-0 before:h-full before:border-l-3 before:border-l-transparent before:content-['']",
          {
            'shadow-inner-md before:border-l-neon bg-asphalt': match,
            'cursor-not-allowed bg-transparent': !match && disabled,
            'hover:shadow-inner-md hover:before:border-l-neon hover:bg-asphalt cursor-pointer bg-transparent':
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
