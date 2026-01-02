import { cloneElement, ComponentProps, type JSX, ReactNode } from 'react'

import { ClipboardHelper } from '@renderer/helpers/ClipboardHelper'
import { StyleHelper } from '@renderer/helpers/StyleHelper'

import MdOutlineContentCopy from '@renderer/assets/images/md-outline-content-copy.svg?react'

import { IconButton } from './IconButton'
import { Separator } from './Separator'

type TRootProps = ComponentProps<'div'>
const Root = ({ className, children, ...props }: TRootProps) => {
  return (
    <div
      className={StyleHelper.mergeStyles('bg-asphalt flex w-full flex-col rounded-sm px-4 py-2.5', className)}
      {...props}
    >
      {children}
    </div>
  )
}

type THeaderProps = {
  rightElement?: JSX.Element
  leftElement?: JSX.Element
} & ComponentProps<'div'>

const Header = ({ children, className, leftElement, rightElement, ...props }: THeaderProps) => {
  return (
    <div className={StyleHelper.mergeStyles('flex items-center gap-2.5', className)} {...props}>
      {leftElement &&
        cloneElement(leftElement, {
          'aria-hidden': true,
          className: StyleHelper.mergeStyles('text-blue w-6 h-6', leftElement.props.className),
        })}

      <div className="grow">
        {typeof children === 'string' ? <span className="text-sm text-white">{children}</span> : children}
      </div>

      {rightElement}
    </div>
  )
}

type THeaderSeparatorProps = ComponentProps<typeof Separator>
const HeaderSeparator = ({ className, ...props }: THeaderSeparatorProps) => {
  return <Separator className={StyleHelper.mergeStyles('mt-2.5', className)} {...props} />
}

type TBodyProps = ComponentProps<'div'>
const Body = ({ className, children, ...props }: TBodyProps) => {
  return (
    <div className={StyleHelper.mergeStyles('flex flex-col', className)} {...props}>
      {children}
    </div>
  )
}

type TPanelProps = { label?: string } & ComponentProps<'div'>
const Panel = ({ className, children, label, ...props }: TPanelProps) => {
  return (
    <div className={StyleHelper.mergeStyles('flex flex-col', className)} {...props}>
      {label && <div className="text-blue bg-gray-300/15 px-3.5 py-1.5 text-xs">{label}</div>}

      {children}
    </div>
  )
}

type TItemProps = { label?: ReactNode; copyable?: string; contentClassName?: string } & ComponentProps<'div'>

const Item = ({ label, children, copyable, className, contentClassName, ...props }: TItemProps) => {
  const handleCopy = () => {
    if (copyable) ClipboardHelper.write(copyable)
  }

  return (
    <div className="group flex flex-col">
      <div className={StyleHelper.mergeStyles('flex flex-col gap-2.5 py-4', className)} {...props}>
        {typeof label === 'string' ? <span className="text-xs text-gray-100 uppercase">{label}</span> : label}

        <div className={StyleHelper.mergeStyles('flex items-center gap-2.5', contentClassName)}>
          {typeof children === 'string' ? <span className="text-sm break-all text-white">{children}</span> : children}

          {copyable && (
            <IconButton
              icon={<MdOutlineContentCopy aria-hidden className="text-neon" />}
              size="sm"
              onClick={handleCopy}
              compacted
            />
          )}
        </div>
      </div>

      <Separator className="group-last:hidden" />
    </div>
  )
}

export const Details = { Root, Header, Body, Panel, Item, HeaderSeparator }
