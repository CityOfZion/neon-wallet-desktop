import { cloneElement, ComponentProps, type JSX } from 'react'

import { match } from 'ts-pattern'

import { StyleHelper } from '@renderer/helpers/StyleHelper'

export type TCustomIconClickableProps = {
  icon: JSX.Element
  text?: string
  size?: 'xs' | 'sm' | 'md'
  fullHeight?: boolean
  compacted?: boolean
  rounded?: boolean
  variant?: 'ghost' | 'outline' | 'contained'
  colorSchema?: 'neon' | 'gray' | 'white' | 'yellow' | 'error'
  disabled?: boolean
}

type TProps = TCustomIconClickableProps & ComponentProps<'div'>

const Contained = ({ className, colorSchema, ...props }: TProps) => {
  return (
    <Base
      className={StyleHelper.mergeStyles(
        'text-asphalt',
        {
          'bg-neon': colorSchema === 'neon',
          'bg-gray-100': colorSchema === 'gray',
          'bg-white': colorSchema === 'white',
          'bg-yellow': colorSchema === 'yellow',
          'bg-pink': colorSchema === 'error',
        },
        'group-aria-disabled:cursor-not-allowed group-aria-disabled:opacity-30 group-aria-expanded:opacity-75 group-aria-selected:opacity-75 group-hover:group-aria-[disabled=false]:opacity-75 hover:group-aria-expanded:opacity-50 hover:group-aria-selected:opacity-50',
        className
      )}
      colorSchema={colorSchema}
      {...props}
    />
  )
}

const Ghost = ({ className, colorSchema, ...props }: TProps) => {
  return (
    <Base
      className={StyleHelper.mergeStyles(
        {
          'text-neon': colorSchema === 'neon',
          'text-gray-100': colorSchema === 'gray',
          'text-white': colorSchema === 'white',
          'text-yellow': colorSchema === 'yellow',
          'text-pink': colorSchema === 'error',
        },
        'group-aria-disabled:cursor-not-allowed group-aria-disabled:opacity-30 group-aria-expanded:bg-gray-300/15 group-aria-selected:bg-gray-300/15 group-hover:group-aria-[disabled=false]:bg-gray-300/15 hover:group-aria-expanded:bg-gray-300/30 hover:group-aria-selected:bg-gray-300/30',
        className
      )}
      colorSchema={colorSchema}
      {...props}
    />
  )
}

const Outline = ({ className, colorSchema, ...props }: TProps) => {
  return (
    <Base
      className={StyleHelper.mergeStyles(
        'border',
        {
          'border-neon text-neon': colorSchema === 'neon',
          'border-gray-300/15 text-gray-100': colorSchema === 'gray',
          'border-white text-white': colorSchema === 'white',
          'border-yellow text-yellow': colorSchema === 'yellow',
          'border-pink text-pink': colorSchema === 'error',
        },
        'group-aria-disabled:cursor-not-allowed group-aria-disabled:opacity-30 group-aria-expanded:bg-gray-300/15 group-aria-selected:bg-gray-300/15 group-hover:group-aria-[disabled=false]:bg-gray-300/15 hover:group-aria-expanded:bg-gray-300/30 hover:group-aria-selected:bg-gray-300/30',
        className
      )}
      colorSchema={colorSchema}
      {...props}
    />
  )
}

const Base = ({
  size,
  icon,
  variant: _variant,
  colorSchema: _colorSchema,
  compacted,
  fullHeight,
  text,
  rounded,
  ...props
}: TProps) => {
  return (
    <div
      {...props}
      className={StyleHelper.mergeStyles(
        'flex h-fit grow-0 flex-col items-center justify-center rounded-sm transition-all',
        {
          'gap-y-0.5 px-2 py-1': (size === 'sm' || size === 'xs') && !compacted,
          'gap-y-0.5 p-1': (size === 'sm' || size === 'xs') && compacted,
          'gap-y-1 px-3 py-1.5': size === 'md' && !compacted,
          'gap-y-1 p-1': size === 'md' && compacted,
          'h-full rounded-none': fullHeight,
          'rounded-full': rounded,
        },
        props.className
      )}
    >
      {cloneElement(icon, {
        ...icon.props,
        'aria-hidden': true,
        className: StyleHelper.mergeStyles(
          'object-contain',
          {
            'w-4 h-4': size === 'xs',
            'w-5 h-5': size === 'sm',
            'w-6 h-6': size === 'md',
          },
          icon.props.className
        ),
      })}

      {text && <span className="text-1xs whitespace-nowrap">{text}</span>}
    </div>
  )
}

export const IconClickable = ({
  colorSchema = 'gray',
  disabled = false,
  icon,
  text,
  size = 'xs',
  fullHeight = false,
  compacted = false,
  variant = 'ghost',
  rounded = false,
  ...rest
}: TProps) => {
  const props = { ...rest, variant, colorSchema, disabled, icon, rounded, text, size, fullHeight, compacted }

  return match(props.variant)
    .with('ghost', () => <Ghost {...props} />)
    .with('outline', () => <Outline {...props} />)
    .with('contained', () => <Contained {...props} />)
    .exhaustive()
}
