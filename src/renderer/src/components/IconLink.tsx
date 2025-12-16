import type { ComponentProps, Ref } from 'react'
import { Link as RRDLink, LinkProps as RRDLinkProps } from 'react-router'

import { StyleHelper } from '@renderer/helpers/StyleHelper'

import { IconClickable, type TCustomIconClickableProps } from './IconClickable'

type TProps = TCustomIconClickableProps & { clickableProps?: ComponentProps<'div'> } & RRDLinkProps & {
    ref?: Ref<HTMLAnchorElement>
  }

export const IconLink = ({
  icon,
  text,
  size,
  rounded,
  fullHeight,
  compacted,
  variant,
  colorSchema,
  className,
  clickableProps,
  disabled,
  loading,
  onClick,
  ref,
  ...props
}: TProps) => {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    if (disabled) {
      e.preventDefault()
    }

    onClick?.(e)
  }

  const isDisabled = disabled || loading || false

  return (
    <RRDLink
      {...props}
      aria-disabled={isDisabled}
      className={StyleHelper.mergeStyles('group cursor-default', className)}
      onClick={handleClick}
      ref={ref}
    >
      <IconClickable
        {...clickableProps}
        variant={variant}
        icon={icon}
        text={text}
        size={size}
        fullHeight={fullHeight}
        compacted={compacted}
        colorSchema={colorSchema}
        rounded={rounded}
        disabled={isDisabled}
        loading={loading}
      />
    </RRDLink>
  )
}
