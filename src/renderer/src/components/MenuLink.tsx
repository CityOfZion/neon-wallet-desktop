import { cloneElement, Fragment, type JSX } from 'react'

import { motion } from 'motion/react'
import { NavLink, type NavLinkProps, useMatch } from 'react-router'

import { StyleHelper } from '@renderer/helpers/StyleHelper'

import MdChevronRight from '@renderer/assets/images/md-chevron-right.svg?react'

export type TMenuLinkProps = {
  iconElement?: JSX.Element
  rightElement?: JSX.Element | null
  layoutId: string
  disabled?: boolean
  matchRoot?: string
} & NavLinkProps

export const MenuLink = ({
  layoutId,
  className,
  iconElement,
  disabled = false,
  rightElement,
  children,
  to,
  ...props
}: TMenuLinkProps): JSX.Element => {
  const rightElementWithDefault =
    rightElement === undefined ? <MdChevronRight aria-hidden className="size-6" /> : rightElement

  const match = useMatch(`${to}/*`)

  const shouldNavigate = !disabled && !match

  return (
    <NavLink
      {...props}
      to={to}
      tabIndex={!shouldNavigate ? -1 : 0}
      aria-disabled={disabled}
      className={StyleHelper.mergeStyles(
        'group relative flex w-full items-center gap-x-3 px-4 py-3.5 text-xs text-gray-100 transition-colors',
        'hover:bg-asphalt focus:bg-asphalt aria-[current=page]:bg-asphalt cursor-pointer aria-[current=page]:text-white',
        'aria-disabled:cursor-default aria-disabled:opacity-50',
        {
          'pointer-events-none': !shouldNavigate,
        },
        className
      )}
    >
      {linkState => (
        <Fragment>
          {linkState.isActive && (
            <motion.div
              layoutId={layoutId}
              className="bg-neon group-aria-[current=page]:text-neon absolute top-0 left-0 h-full w-0.75"
              transition={{ duration: 0.15, ease: [0.4, 0, 0.2, 1] }}
            />
          )}

          {iconElement &&
            cloneElement(iconElement, {
              ...iconElement.props,
              className: StyleHelper.mergeStyles(
                'size-6 transition-colors group-aria-[current=page]:text-neon',
                iconElement.props.className
              ),
            })}

          {typeof children === 'string' ? (
            <span className="grow">{children}</span>
          ) : typeof children === 'function' ? (
            children(linkState)
          ) : (
            children
          )}

          {rightElementWithDefault &&
            cloneElement(rightElementWithDefault, {
              ...rightElementWithDefault.props,
              className: StyleHelper.mergeStyles('size-5 transition-colors', rightElementWithDefault.props.className),
            })}
        </Fragment>
      )}
    </NavLink>
  )
}
