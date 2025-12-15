import { ComponentProps } from 'react'

import { StyleHelper } from '@renderer/helpers/StyleHelper'

import { IconClickable, TCustomIconClickableProps } from './IconClickable'

type TProps = TCustomIconClickableProps & { clickableProps?: ComponentProps<'div'> } & ComponentProps<'button'>

export const IconButton = ({
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
  ref,
  ...props
}: TProps) => {
  const isDisabled = disabled || loading || false

  return (
    <button
      {...props}
      className={StyleHelper.mergeStyles('group', className)}
      aria-disabled={isDisabled}
      disabled={isDisabled}
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
    </button>
  )
}
