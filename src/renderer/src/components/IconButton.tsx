import { cloneElement, ComponentProps, forwardRef } from 'react'
import { StyleHelper } from '@renderer/helpers/StyleHelper'

type TProps = {
  icon: JSX.Element
  text?: string
  size?: 'xs' | 'sm' | 'md'
  fullHeight?: boolean
  compacted?: boolean
  variant?: 'ghost' | 'outline'
  colorSchema?: 'neon' | 'gray' | 'white' | 'yellow' | 'error'
} & ComponentProps<'button'>

export const IconButton = forwardRef<HTMLButtonElement, TProps>(
  ({ text, icon, size = 'xs', fullHeight, compacted, variant = 'ghost', colorSchema = 'gray', ...props }, ref) => {
    const { className: iconClassName, ...iconProps } = icon.props

    return (
      <button
        ref={ref}
        {...props}
        className={StyleHelper.mergeStyles(
          'flex h-fit flex-grow-0 flex-col items-center justify-center rounded transition-colors hover:enabled:bg-gray-300/15 disabled:cursor-not-allowed disabled:opacity-50 aria-expanded:bg-gray-300/15 aria-expanded:hover:bg-gray-300/30 aria-selected:bg-gray-300/15 aria-selected:hover:bg-gray-300/30',
          {
            'gap-y-0.5 px-2 py-1': (size === 'sm' || size === 'xs') && !compacted,
            'gap-y-0.5 p-1': (size === 'sm' || size === 'xs') && compacted,
            'gap-y-1 px-3 py-1.5': size === 'md' && !compacted,
            'gap-y-1 p-1': size === 'md' && compacted,
            'border-neon text-neon': colorSchema === 'neon',
            'border-gray-300/15 text-gray-100': colorSchema === 'gray',
            'border-white text-white': colorSchema === 'white',
            'border-yellow text-yellow': colorSchema === 'yellow',
            'border-pink text-pink': colorSchema === 'error',
            'h-full rounded-none': fullHeight,
            border: variant === 'outline',
          },
          props.className
        )}
      >
        {cloneElement(icon, {
          'aria-hidden': true,
          className: StyleHelper.mergeStyles(
            'object-contain',
            {
              'w-4 h-4': size === 'xs',
              'w-5 h-5': size === 'sm',
              'w-6 h-6': size === 'md',
            },
            iconClassName
          ),
          ...iconProps,
        })}
        {text && <span className="whitespace-nowrap text-1xs">{text}</span>}
      </button>
    )
  }
)
