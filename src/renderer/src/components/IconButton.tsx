import { ComponentProps, forwardRef } from 'react'

import { StyleHelper } from '@renderer/helpers/StyleHelper'

import { IconClickable, TCustomIconClickableProps } from './IconClickable'

type TProps = TCustomIconClickableProps & { clickableProps?: ComponentProps<'div'> } & ComponentProps<'button'>

export const IconButton = forwardRef<HTMLButtonElement, TProps>(
  (
    {
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
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || false

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
        />
      </button>
    )
  }
)
