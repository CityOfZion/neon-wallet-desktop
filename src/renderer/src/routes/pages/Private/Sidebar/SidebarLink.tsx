import { cloneElement, type JSX } from 'react'

import { MenuLink, type TMenuLinkProps } from '@renderer/components/MenuLink'

type TProps = Omit<TMenuLinkProps, 'layoutId' | 'rightElement' | 'children' | 'className'> & {
  children: string
  className?: string
}

export const SidebarLink = ({ iconElement, children, className, ...props }: TProps): JSX.Element => {
  return (
    <li className={className}>
      <MenuLink
        {...props}
        layoutId="sidebar-link"
        className="text-1xs flex-col gap-1 px-0 py-2.5"
        rightElement={null}
        iconElement={
          iconElement
            ? cloneElement(iconElement, { className: 'group-aria-[current=page]:text-inherit', 'aria-hidden': true })
            : undefined
        }
      >
        <span className="text-center leading-3">{children}</span>
      </MenuLink>
    </li>
  )
}
