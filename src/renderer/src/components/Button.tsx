import { forwardRef } from 'react'

import { Clickable, TCustomClickableProps } from './Clickable'

type TProps = TCustomClickableProps & { clickableProps?: React.ComponentProps<'div'> } & React.ComponentProps<'button'>

export const Button = forwardRef<HTMLButtonElement, TProps>(
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
