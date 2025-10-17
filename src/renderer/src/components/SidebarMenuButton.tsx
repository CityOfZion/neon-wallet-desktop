import type { JSX } from 'react'
import { NavLink } from 'react-router'

import { Separator } from '@renderer/components/Separator'

import { StyleHelper } from '@renderer/helpers/StyleHelper'

import MdChevronRight from '@renderer/assets/images/md-chevron-right.svg?react'

type TProps = {
  title: string
  to?: string
}

const buildClassName = (isActive: boolean) => {
  return StyleHelper.mergeStyles(
    'px-4 w-full flex border-l-[0.1875rem] justify-between py-3.5 items-center transition-colors',
    {
      'border-l-neon bg-asphalt stroke-neon': isActive,
      'border-l-transparent cursor-pointer opacity-60 hover:border-l-neon hover:bg-asphalt hover:opacity-100 hover:stroke-neon hover:text-neon':
        !isActive,
    }
  )
}

export const SidebarMenuButton = ({ title, to }: TProps): JSX.Element => {
  return (
    <li>
      <NavLink to={to ?? ''} className={({ isActive }) => buildClassName(isActive)}>
        <span className="text-xs text-white">{title}</span>
        <MdChevronRight aria-hidden className="h-6 w-6 text-gray-100" />
      </NavLink>
      <div className="px-4">
        <Separator />
      </div>
    </li>
  )
}
