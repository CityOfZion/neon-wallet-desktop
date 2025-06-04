import { cloneElement, ComponentProps } from 'react'
import { NavLink } from 'react-router-dom'
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

  return (
    <li>
      <NavLink
        to={to}
        onClick={handleClick}
        className={({ isActive }) => {
          return StyleHelper.mergeStyles(
            'group relative flex w-full flex-col items-center justify-center gap-1 py-2.5 text-1xs text-white transition-colors',
            {
              'shadow-inner-md border-l-3 border-l-neon bg-asphalt pr-0.75': isActive,
              'cursor-not-allowed bg-transparent': !isActive && disabled,
              'hover:shadow-inner-md cursor-pointer bg-transparent hover:border-l-3 hover:border-l-neon hover:bg-asphalt hover:pr-0.75':
                !isActive && !disabled,
            }
          )
        }}
        {...props}
      >
        {cloneElement(icon, {
          className: 'group-aria-[current=page]:stroke-white stroke-gray-300 object-contain w-6 h-6',
        })}

        <span className="px-1 text-center leading-3">{title}</span>
      </NavLink>
    </li>
  )
}
