import { cloneElement } from 'react'
import { StyleHelper } from '@renderer/helpers/StyleHelper'

import { Loader } from './Loader'

export type TCustomClickableProps = {
  label: string
  leftIcon?: JSX.Element
  rightIcon?: JSX.Element
  variant?: 'outlined' | 'contained' | 'text' | 'text-slim'
  disabled?: boolean
  loading?: boolean
  flat?: boolean
  wide?: boolean
  colorSchema?: 'neon' | 'gray' | 'white' | 'error'
  iconsOnEdge?: boolean
}

export type TClickableProps = TCustomClickableProps & React.ComponentProps<'div'>

const Outline = ({ className, ...props }: TClickableProps) => {
  return (
    <Base
      className={StyleHelper.mergeStyles(
        'group flex items-center justify-center border text-center py-3 gap-x-2.5 cursor-pointer transition-colors ',
        'aria-[disabled=true]:opacity-100 aria-[disabled=true]:text-gray-100/50 aria-[disabled=true]:border-gray-100/50',
        'aria-[disabled=false]:hover:bg-gray-300/15',
        {
          'border-neon': props.colorSchema === 'neon',
          'border-gray-100': props.colorSchema === 'gray',
          'border-white': props.colorSchema === 'white',
          'border-pink': props.colorSchema === 'error',
        },
        className
      )}
      {...props}
    />
  )
}

const Contained = ({ className, ...props }: TClickableProps) => {
  return (
    <Base
      className={StyleHelper.mergeStyles(
        'flex min-w-0 justify-center items-center text-center py-3 gap-x-2.5 transition-colors rounded',
        'aria-[disabled=true]:bg-gray-300/30 aria-[disabled=true]:text-gray-100/50 aria-[disabled=true]:opacity-100',
        'aria-[disabled=false]:bg-gradient-to-t aria-[disabled=false]:from-gray-800 aria-[disabled=false]:to-gray-600 aria-[disabled=false]:shadow-[4px_8px_20px_0px_rgba(18,21,23,0.40),inset_1px_1px_0px_0px_rgba(214,210,210,0.14),inset_-1px_-1px_0px_0px_rgba(0,0,0,0.32)] aria-[disabled=false]:hover:from-gray-600 aria-[disabled=false]:hover:to-gray-600',
        className
      )}
      {...props}
    />
  )
}

const Text = ({ className, ...props }: TClickableProps) => {
  return (
    <Base
      className={StyleHelper.mergeStyles(
        'flex min-w-0 justify-center items-center text-center gap-x-1.5 aria-[disabled=false]:hover:bg-gray-300/15 rounded transition-colors',
        className
      )}
      {...props}
    />
  )
}

const TextSlim = ({ className, ...props }: TClickableProps) => {
  return (
    <Base
      className={StyleHelper.mergeStyles(
        className,
        'flex min-w-0 justify-center items-center text-center gap-x-1.5 aria-[disabled=false]:hover:opacity-75 h-fit px-0'
      )}
      {...props}
    />
  )
}

const Base = ({
  leftIcon,
  rightIcon,
  label,
  disabled,
  loading,
  flat,
  colorSchema,
  iconsOnEdge,
  wide,
  ...props
}: TClickableProps) => {
  const { className: leftIconClassName = '', ...leftIconProps } = leftIcon ? leftIcon.props : {}
  const { className: rightIconClassName = '', ...rightIconProps } = rightIcon ? rightIcon.props : {}

  const isDisabled = disabled ?? loading

  const buildIconClassName = (className: string) => {
    return StyleHelper.mergeStyles(
      'object-contain',
      {
        'w-[1.5rem] h-[1.5rem] min-w-[1.5rem] min-h-[1.5rem]': !flat,
        'w-[1.25rem] h-[1.25rem] min-w-[1.25rem] min-h-[1.25rem]': flat,
      },
      className
    )
  }

  return (
    <div
      aria-disabled={isDisabled}
      className={StyleHelper.mergeStyles(
        'aria-[disabled=true]:cursor-not-allowed w-full aria-[disabled=true]:opacity-50 aria-[disabled=false]:cursor-pointer',
        {
          'px-7': wide,
          'h-12 text-sm': !flat,
          'h-8.5 text-xs': flat,
          'px-3': !flat && !wide,
          'px-2': flat && !wide,
          'text-neon': colorSchema === 'neon',
          'text-gray-200': colorSchema === 'gray',
          'text-white': colorSchema === 'white',
          'text-pink': colorSchema === 'error',
        },

        props.className
      )}
    >
      {!loading ? (
        <>
          {leftIcon &&
            cloneElement(leftIcon, {
              className: buildIconClassName(leftIconClassName),
              ...leftIconProps,
            })}

          <span
            className={StyleHelper.mergeStyles('font-medium truncate', {
              'flex-grow': iconsOnEdge,
            })}
          >
            {label}
          </span>

          {rightIcon &&
            cloneElement(rightIcon, {
              className: buildIconClassName(rightIconClassName),
              ...rightIconProps,
            })}
        </>
      ) : (
        <Loader
          className={StyleHelper.mergeStyles({
            'w-6 h-6': !flat,
            'w-5 h-5': flat,
          })}
        />
      )}
    </div>
  )
}

export const Clickable = ({
  colorSchema = 'neon',
  disabled = false,
  loading = false,
  flat = false,
  iconsOnEdge = true,
  wide = false,
  ...rest
}: TClickableProps) => {
  const props = { ...rest, wide, colorSchema, disabled, loading, flat, iconsOnEdge }

  return props.variant === 'outlined' ? (
    <Outline {...props} />
  ) : props.variant === 'text' ? (
    <Text {...props} />
  ) : props.variant === 'text-slim' ? (
    <TextSlim {...props} />
  ) : (
    <Contained {...props} />
  )
}
