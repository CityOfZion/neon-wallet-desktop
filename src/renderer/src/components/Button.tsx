import { forwardRef } from 'react'

import { Clickable, TCustomClickableProps } from './Clickable'

export type TButtonProps = TCustomClickableProps & {
  clickableProps?: React.ComponentProps<'div'>
} & React.ComponentProps<'button'>

export const Button = forwardRef<HTMLButtonElement, TButtonProps>(
  (
    {
      clickableProps,
      label,
      variant,
      rightIcon,
      leftIcon,
      flat,
      loading,
      colorSchema,
      iconsOnEdge,
      disabled,
      wide,
      textClassName,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading

    return (
      <button {...props} disabled={isDisabled} ref={ref}>
        <Clickable
          {...clickableProps}
          label={label}
          variant={variant}
          leftIcon={leftIcon}
          rightIcon={rightIcon}
          flat={flat}
          loading={loading}
          disabled={isDisabled}
          colorSchema={colorSchema}
          iconsOnEdge={iconsOnEdge}
          wide={wide}
          textClassName={textClassName}
        />
      </button>
    )
  }
)
