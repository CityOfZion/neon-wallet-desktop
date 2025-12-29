import { cloneElement, Fragment, type JSX, ReactNode } from 'react'

import { match, P } from 'ts-pattern'

import { StyleHelper } from '@renderer/helpers/StyleHelper'

import { Loader } from './Loader'

export type TCustomClickableProps = {
  label?: ReactNode
  leftIcon?: JSX.Element
  rightIcon?: JSX.Element
  variant?: 'outlined' | 'contained' | 'text' | 'text-slim' | 'card'
  disabled?: boolean
  loading?: boolean
  flat?: boolean
  wide?: boolean
  colorSchema?: 'neon' | 'gray' | 'white' | 'error' | 'blue' | 'yellow'
  iconsOnEdge?: boolean
  textClassName?: string
}

export type TClickableProps = TCustomClickableProps & React.ComponentProps<'div'>

const buildIconClassName = (side: 'left' | 'right', className: string, flat?: boolean) => {
  return StyleHelper.mergeStyles(
    'object-contain',
    {
      '-ml-1': side === 'left',
      '-mr-1': side === 'right',
      'w-6 h-6 min-w-6 min-h-6': !flat,
      'w-5 h-5 min-w-5 min-h-5': flat,
    },
    className
  )
}

const Outline = ({ className, ...props }: TClickableProps) => {
  return (
    <Base
      className={StyleHelper.mergeStyles(
        'group flex cursor-pointer items-center justify-center rounded-sm border py-3 text-center transition-colors',
        'group-aria-disabled:border-gray-100/50 group-aria-disabled:text-gray-100/50 group-aria-disabled:opacity-100',
        'group-aria-expanded:bg-gray-300/15 group-aria-selected:bg-gray-300/15 hover:group-aria-[disabled=false]:bg-gray-300/15',
        {
          'border-neon': props.colorSchema === 'neon',
          'border-gray-100': props.colorSchema === 'gray',
          'border-white': props.colorSchema === 'white',
          'border-pink': props.colorSchema === 'error',
          'border-blue': props.colorSchema === 'blue',
          'border-yellow': props.colorSchema === 'yellow',
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
        'flex min-w-0 items-center justify-center rounded-sm py-3 text-center transition-colors',
        'group-aria-disabled:bg-gray-300/30 group-aria-disabled:text-gray-100/50 group-aria-disabled:opacity-100',
        'group-aria-[disabled=false]:bg-linear-to-t group-aria-[disabled=false]:from-gray-800 group-aria-[disabled=false]:to-gray-600 group-aria-[disabled=false]:shadow-[4px_8px_20px_0px_rgba(18,21,23,0.40),inset_1px_1px_0px_0px_rgba(214,210,210,0.14),inset_-1px_-1px_0px_0px_rgba(0,0,0,0.32)] hover:group-aria-[disabled=false]:from-gray-600 hover:group-aria-[disabled=false]:to-gray-600',
        'group-aria-expanded:group-aria-[disabled=false]:from-gray-600 group-aria-expanded:group-aria-[disabled=false]:to-gray-600 group-aria-selected:group-aria-[disabled=false]:from-gray-600 group-aria-selected:group-aria-[disabled=false]:to-gray-600',
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
        'flex min-w-0 items-center justify-center rounded-sm text-center transition-colors group-aria-expanded:bg-gray-300/15 group-aria-selected:bg-gray-300/15 hover:group-aria-[disabled=false]:bg-gray-300/15',
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
        'flex h-fit min-w-0 items-center justify-center gap-x-1.5 px-0 text-center transition-opacity group-aria-expanded:opacity-75 group-aria-selected:opacity-75 hover:group-aria-[disabled=false]:opacity-75 focus:group-aria-[disabled=false]:opacity-75 active:group-aria-[disabled=false]:opacity-50',
        className
      )}
      {...props}
    />
  )
}

const Card = ({ className, ...props }: TClickableProps) => {
  return (
    <Base
      className={StyleHelper.mergeStyles(
        'flex min-w-0 items-center justify-center rounded-sm py-3 text-center transition-colors',
        'group-aria-disabled:bg-gray-300/30 group-aria-disabled:text-gray-100/50 group-aria-disabled:opacity-100',
        'group-aria-expanded:bg-gray-300/30 group-aria-selected:bg-gray-300/30 group-aria-[disabled=false]:bg-gray-300/15 hover:group-aria-[disabled=false]:bg-gray-300/30',
        className
      )}
      {...props}
    />
  )
}

const Base = ({
  leftIcon,
  rightIcon,
  label,
  loading,
  flat,
  colorSchema,
  iconsOnEdge,
  wide,
  textClassName,
  children,
  ...props
}: TClickableProps) => {
  const { className: leftIconClassName = '', ...leftIconProps } = leftIcon ? leftIcon.props : {}
  const { className: rightIconClassName = '', ...rightIconProps } = rightIcon ? rightIcon.props : {}

  return (
    <div
      className={StyleHelper.mergeStyles(
        'w-full gap-x-2.5 group-aria-disabled:cursor-not-allowed group-aria-disabled:opacity-50 group-aria-[disabled=false]:cursor-pointer',
        {
          'px-7': wide,
          'h-12 text-sm': !flat,
          'h-8.5 gap-x-1.5 text-xs': flat,
          'px-4': !flat && !wide,
          'px-2.5': flat && !wide,
          'text-neon': colorSchema === 'neon',
          'text-gray-200': colorSchema === 'gray',
          'text-white': colorSchema === 'white',
          'text-pink': colorSchema === 'error',
          'text-blue': colorSchema === 'blue',
          'text-yellow': colorSchema === 'yellow',
        },
        props.className
      )}
    >
      {!loading ? (
        <Fragment>
          {leftIcon &&
            cloneElement(leftIcon, {
              className: buildIconClassName('left', leftIconClassName, flat),
              ...leftIconProps,
            })}

          {match({ label, children })
            .with({ children: P.nonNullable }, () => children)
            .with({ label: P.string }, () => (
              <span
                className={StyleHelper.mergeStyles(
                  'truncate font-medium',
                  {
                    grow: iconsOnEdge,
                  },
                  textClassName
                )}
              >
                {label}
              </span>
            ))
            .otherwise(() => label)}

          {rightIcon &&
            cloneElement(rightIcon, {
              className: buildIconClassName('right', rightIconClassName, flat),
              ...rightIconProps,
            })}
        </Fragment>
      ) : (
        <Loader
          className={StyleHelper.mergeStyles({
            'h-6 w-6': !flat,
            'h-5 w-5': flat,
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
  variant = 'contained',
  ...rest
}: TClickableProps) => {
  const props = { ...rest, wide, variant, colorSchema, disabled, loading, flat, iconsOnEdge }

  return match(props.variant)
    .with('outlined', () => <Outline {...props} />)
    .with('contained', () => <Contained {...props} />)
    .with('text', () => <Text {...props} />)
    .with('text-slim', () => <TextSlim {...props} />)
    .with('card', () => <Card {...props} />)
    .exhaustive()
}
