import { ComponentProps, ComponentPropsWithoutRef, ElementRef, forwardRef } from 'react'
import * as RadixPopover from '@radix-ui/react-popover'
import { Link } from '@renderer/components/Link'
import { StyleHelper } from '@renderer/helpers/StyleHelper'

import { Button } from './Button'
import { Separator } from './Separator'

const Root = RadixPopover.Root

const Trigger = RadixPopover.Trigger

type TContentProps = ComponentPropsWithoutRef<typeof RadixPopover.Content> & {
  contentClassName?: string
  pointerClassName?: string
  color?: 'neon' | 'yellow'
}

const Content = forwardRef<ElementRef<typeof RadixPopover.Content>, TContentProps>(
  ({ className, contentClassName, pointerClassName, side = 'right', color = 'neon', children, ...props }, ref) => {
    const isRightSide = side === 'right'
    const isLeftSide = side === 'left'
    const isBottomSide = side === 'bottom'
    const isTopSide = side === 'top'
    const isNeonColor = color === 'neon'
    const isYellowColor = color === 'yellow'

    return (
      <RadixPopover.Portal>
        <RadixPopover.Content
          ref={ref}
          className={StyleHelper.mergeStyles('relative group', className)}
          side={side}
          align="center"
          sideOffset={32}
          {...props}
        >
          <div
            className={StyleHelper.mergeStyles(
              'bg-gray-900 flex flex-col rounded overflow-hidden',
              {
                'border-r-4': isRightSide,
                'border-l-4': isLeftSide,
                'border-t-4': isBottomSide,
                'border-b-4': isTopSide,
                'border-neon': isNeonColor,
                'border-yellow': isYellowColor,
              },
              contentClassName
            )}
          >
            {children}
          </div>

          <div
            className={StyleHelper.mergeStyles(
              'flex items-center absolute',
              {
                'right-0 top-2/4 -translate-y-2/4 translate-x-full flex-row-reverse': isRightSide,
                'left-0 top-2/4 -translate-y-2/4 -translate-x-full flex-row': isLeftSide,
                'left-[50%] top-0 -translate-y-4 -translate-x-[50%] rotate-90 flex-row': isBottomSide,
                'left-[50%] bottom-0 translate-y-4 -translate-x-[50%] -rotate-90 flex-row': isTopSide,
              },
              pointerClassName
            )}
          >
            <div
              className={StyleHelper.mergeStyles('w-2 h-2 rounded-full', {
                'bg-neon': isNeonColor,
                'bg-yellow': isYellowColor,
              })}
            />

            <div
              className={StyleHelper.mergeStyles('w-5 h-px', { 'bg-neon': isNeonColor, 'bg-yellow': isYellowColor })}
            />
          </div>
        </RadixPopover.Content>
      </RadixPopover.Portal>
    )
  }
)

type TItemProps =
  | ({ actionPopoverItemType?: 'button' } & ComponentProps<typeof Button>)
  | ({ actionPopoverItemType?: 'link' } & ComponentProps<typeof Link>)

const Item = ({ actionPopoverItemType = 'button', clickableProps, ...props }: TItemProps) => {
  const commonProps: any = {
    variant: 'text',
    flat: true,
    className: 'w-full',
    clickableProps: { className: 'rounded-none h-10 px-4 justify-start', ...clickableProps },
  }

  if (actionPopoverItemType === 'button') {
    return <Button {...commonProps} {...props} />
  }

  return <Link {...commonProps} {...props} />
}

export const ActionPopover = {
  Root,
  Trigger,
  Content,
  Item,
  Separator,
}
