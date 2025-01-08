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
      className={StyleHelper.mergeStyles('flex flex-col py-2.5 px-4 bg-asphalt rounded w-full', className)}
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
      <div className="flex  items-center gap-2.5">
        {icon && cloneElement(icon, { className: StyleHelper.mergeStyles('text-blue w-6 h-6', icon.props.className) })}

        <span className="text-sm text-white">{label}</span>

        {children}
      </div>

      <Separator className="mt-2.5 mb-5" />
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
      <div className="text-blue text-xs py-1.5 px-3.5 bg-gray-300/15 ">{label}</div>

      {children}
    </div>
  )
}

type TItemProps = { label: string; copyable?: string } & ComponentProps<'div'>

const Item = ({ label, children, copyable, className, ...props }: TItemProps) => {
  const handleCopy = () => {
    if (copyable) UtilsHelper.copyToClipboard(copyable)
  }

  return (
    <div className={StyleHelper.mergeStyles('flex flex-col group', className)}>
      <div className="flex flex-col gap-2.5 py-4 px-3" {...props}>
        <span className="text-xs text-gray-100 uppercase">{label}</span>

        <div className="flex gap-2.5 items-center">
          {typeof children === 'string' ? <span className="text-sm text-white break-all">{children}</span> : children}

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
