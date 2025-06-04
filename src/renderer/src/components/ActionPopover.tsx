import { ComponentProps, ComponentPropsWithoutRef, ElementRef, forwardRef } from 'react'
import * as RadixPopover from '@radix-ui/react-popover'
import ActionPopoverArrow from '@renderer/assets/images/action-popover-arrow.svg?react'
import { Link } from '@renderer/components/Link'
import { StyleHelper } from '@renderer/helpers/StyleHelper'

import { Button } from './Button'
import { Separator } from './Separator'

const Root = RadixPopover.Root

const Trigger = RadixPopover.Trigger

type TContentProps = ComponentPropsWithoutRef<typeof RadixPopover.Content> & {
  contentClassName?: string
  color?: 'green' | 'yellow'
}

const Content = forwardRef<ElementRef<typeof RadixPopover.Content>, TContentProps>(
  ({ className, contentClassName, side = 'right', align = 'center', color = 'green', children, ...props }, ref) => {
    const isRightSide = side === 'right'
    const isLeftSide = side === 'left'
    const isBottomSide = side === 'bottom'
    const isTopSide = side === 'top'
    const isGreenColor = color === 'green'
    const isYellowColor = color === 'yellow'

    return (
      <RadixPopover.Portal>
        <RadixPopover.Content
          ref={ref}
          className={StyleHelper.mergeStyles('group relative z-[1010]', className)}
          side={side}
          align={align}
          {...props}
        >
          <div
            className={StyleHelper.mergeStyles(
              'flex flex-col overflow-hidden rounded bg-gray-900/50 backdrop-blur-md',
              {
                'border-r-4': isRightSide,
                'border-l-4': isLeftSide,
                'border-t-4': isBottomSide,
                'border-b-4': isTopSide,
                'border-green': isGreenColor,
                'border-yellow': isYellowColor,
              },
              contentClassName
            )}
          >
            {children}
          </div>

          <RadixPopover.Arrow
            asChild
            width={24}
            height={24}
            className={StyleHelper.mergeStyles({ 'text-green': isGreenColor, 'text-yellow': isYellowColor })}
          >
            <ActionPopoverArrow preserveAspectRatio="xMinYMin" />
          </RadixPopover.Arrow>
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
    return (
      <RadixPopover.PopoverClose asChild>
        <Button {...commonProps} {...props} />
      </RadixPopover.PopoverClose>
    )
  }

  return (
    <RadixPopover.PopoverClose asChild>
      <Link {...commonProps} {...props} />
    </RadixPopover.PopoverClose>
  )
}

export const ActionPopover = {
  Root,
  Trigger,
  Content,
  Item,
  Separator,
}
