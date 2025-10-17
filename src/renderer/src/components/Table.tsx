import { forwardRef, HTMLAttributes, TdHTMLAttributes, ThHTMLAttributes } from 'react'

import { StyleHelper } from '@renderer/helpers/StyleHelper'

import TbCaretDownFilled from '@renderer/assets/images/tb-filled-caret-down.svg?react'
import TbCaretUpFilled from '@renderer/assets/images/tb-filled-caret-up.svg?react'

const Root = forwardRef<HTMLTableElement, HTMLAttributes<HTMLTableElement>>(({ className, ...props }, ref) => (
  <table ref={ref} className={StyleHelper.mergeStyles('w-full caption-bottom text-xs', className)} {...props} />
))

const Header = forwardRef<HTMLTableSectionElement, HTMLAttributes<HTMLTableSectionElement>>((props, ref) => (
  <thead ref={ref} {...props} />
))

const Body = forwardRef<HTMLTableSectionElement, HTMLAttributes<HTMLTableSectionElement>>((props, ref) => (
  <tbody ref={ref} {...props} />
))

const Footer = forwardRef<HTMLTableSectionElement, HTMLAttributes<HTMLTableSectionElement>>(
  ({ className, ...props }, ref) => (
    <tfoot
      ref={ref}
      className={StyleHelper.mergeStyles(
        'border-t border-gray-300/30 bg-transparent font-medium last:[&>tr]:border-b-0',
        className
      )}
      {...props}
    />
  )
)

const HeaderRow = forwardRef<HTMLTableRowElement, HTMLAttributes<HTMLTableRowElement>>(
  ({ className, ...props }, ref) => (
    <tr ref={ref} className={StyleHelper.mergeStyles('transition-colors', className)} {...props} />
  )
)

type TBodyRowProps = {
  hoverable?: boolean
  active?: boolean
}

const BodyRow = forwardRef<HTMLTableRowElement, HTMLAttributes<HTMLTableRowElement> & TBodyRowProps>(
  ({ className, hoverable = true, active = false, ...props }, ref) => (
    <tr
      ref={ref}
      className={StyleHelper.mergeStyles(
        'transition-colors',
        {
          'even:bg-gray-300/15': !active,
          'hover:border-neon border-l-2 border-transparent hover:bg-gray-900/50': hoverable && !active,
          'border-neon border-l-2 bg-gray-900/50': active,
        },
        className
      )}
      {...props}
    />
  )
)

type THeadProps = {
  sortable?: boolean
  sortedBy?: 'asc' | 'desc' | false
}
const Head = forwardRef<HTMLTableCellElement, ThHTMLAttributes<HTMLTableCellElement> & THeadProps>(
  ({ className, children, sortable, sortedBy, ...props }, ref) => (
    <th
      ref={ref}
      className={StyleHelper.mergeStyles(
        'h-9 px-2 text-left align-middle font-medium text-gray-100 [&:has([role=checkbox])]:pr-0 *:[&>[role=checkbox]]:translate-y-[2px]',
        { 'cursor-pointer hover:text-white': sortable },
        className
      )}
      {...props}
    >
      <div className="flex items-center gap-1.5">
        {children}
        {sortable && (
          <div className="relative">
            <TbCaretUpFilled
              aria-hidden
              className={StyleHelper.mergeStyles('-mb-1.5 size-3 opacity-30', {
                'text-white opacity-100': sortedBy === 'asc',
              })}
            />
            <TbCaretDownFilled
              aria-hidden
              className={StyleHelper.mergeStyles('-mt-1.5 size-3 opacity-30', {
                'text-white opacity-100': sortedBy === 'desc',
              })}
            />
          </div>
        )}
      </div>
    </th>
  )
)

const Cell = forwardRef<HTMLTableCellElement, TdHTMLAttributes<HTMLTableCellElement>>(
  ({ className, ...props }, ref) => (
    <td
      ref={ref}
      className={StyleHelper.mergeStyles(
        'p-2 px-2.5 align-middle whitespace-nowrap text-white [&:has([role=checkbox])]:pr-0 *:[&>[role=checkbox]]:translate-y-[2px]',
        className
      )}
      {...props}
    />
  )
)

export const Table = { Root, Header, Body, Footer, BodyRow, HeaderRow, Head, Cell }
