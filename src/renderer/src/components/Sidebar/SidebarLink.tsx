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
            'group text-white text-1xs flex flex-col justify-center items-center gap-1 py-2.5 w-full transition-colors relative',
            {
              'border-l-3 border-l-neon bg-asphalt shadow-inner-md pr-0.75': isActive,
              'bg-transparent cursor-not-allowed': !isActive && disabled,
              'bg-transparent cursor-pointer hover:border-l-neon hover:border-l-3 hover:pr-0.75 hover:bg-asphalt hover:shadow-inner-md':
                !isActive && !disabled,
            }
          )
        }}
        {...props}
      >
        {cloneElement(icon, {
          className: 'group-aria-[current=page]:stroke-white stroke-gray-300 object-contain w-6 h-6',
        })}

        <span className="whitespace-nowrap">{title}</span>
      </NavLink>
    </li>
  )
}
