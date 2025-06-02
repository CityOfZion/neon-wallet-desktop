import { cloneElement, ComponentProps } from 'react'
import { MdOutlineContentCopy } from 'react-icons/md'
import { StyleHelper } from '@renderer/helpers/StyleHelper'
import { UtilsHelper } from '@renderer/helpers/UtilsHelper'

import { IconButton } from './IconButton'
import { Separator } from './Separator'

type TRootProps = ComponentProps<'div'>
const Root = ({ className, children, ...props }: TRootProps) => {
  return (
    <div
      className={StyleHelper.mergeStyles('flex w-full flex-col rounded bg-asphalt px-4 py-2.5', className)}
      {...props}
    >
      {children}
    </div>
  )
}

type THeaderProps = {
  label: string
  icon?: JSX.Element
} & ComponentProps<'div'>
const Header = ({ label, icon, children, ...props }: THeaderProps) => {
  return (
    <div {...props}>
      <div className="flex items-center gap-2.5">
        {icon &&
          cloneElement(icon, {
            'aria-hidden': true,
            className: StyleHelper.mergeStyles('text-blue w-6 h-6', icon.props.className),
          })}

        <span className="text-sm text-white">{label}</span>

        {children}
      </div>

      <Separator className="mb-5 mt-2.5" />
    </div>
  )
}
type TBodyProps = ComponentProps<'div'>
const Body = ({ className, children, ...props }: TBodyProps) => {
  return (
    <div className={StyleHelper.mergeStyles('flex flex-col gap-5', className)} {...props}>
      {children}
    </div>
  )
}

type TPanelProps = { label: string } & ComponentProps<'div'>
const Panel = ({ className, children, label, ...props }: TPanelProps) => {
  return (
    <div className={StyleHelper.mergeStyles('flex flex-col', className)} {...props}>
      <div className="bg-gray-300/15 px-3.5 py-1.5 text-xs text-blue">{label}</div>

      {children}
    </div>
  )
}

type TItemProps = { label: string; copyable?: string; contentClassName?: string } & ComponentProps<'div'>

const Item = ({ label, children, copyable, className, contentClassName, ...props }: TItemProps) => {
  const handleCopy = () => {
    if (copyable) UtilsHelper.copyToClipboard(copyable)
  }

  return (
    <div className={StyleHelper.mergeStyles('group flex flex-col', className)}>
      <div className="flex flex-col gap-2.5 px-3 py-4" {...props}>
        <span className="text-xs uppercase text-gray-100">{label}</span>

        <div className={StyleHelper.mergeStyles('flex items-center gap-2.5', contentClassName)}>
          {typeof children === 'string' ? <span className="break-all text-sm text-white">{children}</span> : children}

          {copyable && (
            <IconButton
              icon={<MdOutlineContentCopy aria-hidden={true} className="text-neon" />}
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

export const Details = { Root, Header, Body, Panel, Item }
