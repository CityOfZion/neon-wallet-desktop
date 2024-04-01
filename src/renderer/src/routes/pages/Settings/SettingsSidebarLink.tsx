import { cloneElement } from 'react'
import { NavLink } from 'react-router-dom'
import { StyleHelper } from '@renderer/helpers/StyleHelper'

type TProps = {
  icon: JSX.Element
  title: string
  to: string
  match?: boolean
  colorSchema?: 'neon' | 'gray'
}

export const SettingsSidebarLink = ({ icon, title, to, match, colorSchema = 'gray' }: TProps): JSX.Element => {
  return (
    <li className="my-3">
      <NavLink to={to} className={({ isActive }) => `group ${isActive || match ? 'active' : ''}`}>
        <div className="py-2 px-3 gap-3 w-full flex border-l-3 justify-content-end transition-colors border-transparent cursor-pointer group-[.active]:border-neon group-[.active]:bg-asphalt group-hover:border-neon group-hover:bg-asphalt">
          {cloneElement(icon, {
            className: StyleHelper.mergeStyles(
              'w-5 h-5 object-contain group-[.active]:text-neon group-hover:text-neon transition-colors',
              {
                'text-neon': colorSchema === 'neon',
                'text-gray-300': colorSchema === 'gray',
              }
            ),
          })}

          <span
            className={StyleHelper.mergeStyles('leading-5  transition-colors', {
              'text-neon': colorSchema === 'neon',
              'text-gray-300 group-[.active]:text-white group-hover:text-white': colorSchema === 'gray',
            })}
          >
            {title}
          </span>
        </div>
      </NavLink>
    </li>
  )
}
