import { cloneElement, ComponentProps, type JSX, type MouseEvent, useLayoutEffect } from 'react'

import { FocusScope } from '@radix-ui/react-focus-scope'
import { motion, useAnimate } from 'motion/react'
import { useHotkeys } from 'react-hotkeys-hook'

import { IconButton } from '@renderer/components/IconButton'
import { Separator } from '@renderer/components/Separator'

import { StyleHelper } from '@renderer/helpers/StyleHelper'

import { useModalCurrentHistory, useModalNavigate } from '@renderer/hooks/useModalRouter'
import { usePressOnce } from '@renderer/hooks/usePressOnce'

import MdClose from '@renderer/assets/images/md-close.svg?react'
import MdKeyboardBackspace from '@renderer/assets/images/md-keyboard-backspace.svg?react'

export type TSideModalSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '1xl'

export type TSideModalLayoutProps = {
  heading?: JSX.Element | string
  headingIcon?: JSX.Element
  contentClassName?: string
  onErase?: () => Promise<void> | void
  onBack?: () => Promise<void> | void
  size?: TSideModalSize
  withClose?: boolean
  closeOnEsc?: boolean
  closeOnClickOutside?: boolean
} & ComponentProps<'div'>

const widthBySizes: Record<TSideModalSize, number> = {
  xs: 224,
  sm: 330,
  md: 414,
  lg: 512,
  xl: 720,
  '1xl': 1000,
}

export const SideModalLayout = ({
  children,
  heading,
  headingIcon,
  contentClassName,
  onErase,
  onBack,
  size = 'sm',
  className,
  withClose = true,
  closeOnClickOutside = true,
  closeOnEsc = true,
  ...props
}: TSideModalLayoutProps) => {
  const { modalErase, modalNavigate } = useModalNavigate()
  const { groupIndex, isFocused, isGroupFocused } = useModalCurrentHistory()

  const [scope, animate] = useAnimate<HTMLDivElement>()

  const widthBySize = widthBySizes[size] || 0

  const [isErasing, startErase] = usePressOnce(async () => {
    if (onErase) {
      await onErase()
    }
    modalErase()
  })

  const [isGoingBack, startGoingBack] = usePressOnce(async () => {
    await onBack?.()
    modalNavigate(-1)
  })

  const handleClickContent = (event: MouseEvent<HTMLDivElement>) => {
    event.stopPropagation()
  }

  const handleClickContainer = () => {
    if (!closeOnClickOutside) return
    startErase()
  }

  useLayoutEffect(() => {
    animate(scope.current, { opacity: isGroupFocused ? 1 : 0 }, { duration: 0.4 })
  }, [animate, isGroupFocused, scope])

  useHotkeys('esc', startErase, { enableOnFormTags: true, enabled: closeOnEsc && !isErasing && isFocused })

  return (
    <FocusScope
      loop
      className={StyleHelper.mergeStyles('flex h-full w-full justify-end', {
        'pointer-events-none': isErasing,
      })}
      onClick={handleClickContainer}
    >
      <motion.div
        className="relative h-full"
        initial={{ width: 0, opacity: 0, transition: { duration: 0.2 } }}
        animate={{ width: widthBySize, opacity: 1, transition: { duration: 0.2 } }}
        exit={{ width: 0, opacity: 0, transition: { duration: 0.2, delay: 0.1 } }}
        onClick={handleClickContent}
        ref={scope}
      >
        <div
          className={StyleHelper.mergeStyles('flex h-full flex-col bg-gray-800 text-xs text-white', className)}
          style={{ minWidth: widthBySizes[size], ...props.style }}
          {...props}
        >
          <header className="flex flex-col px-4">
            <div className="flex items-center justify-between py-2.5">
              {groupIndex > 0 && (
                <IconButton
                  icon={<MdKeyboardBackspace aria-hidden className="fill-gray-200" />}
                  size="md"
                  compacted
                  loading={onBack ? isGoingBack : false}
                  onClick={startGoingBack}
                />
              )}

              <div className="flex items-center gap-x-2.5">
                {headingIcon &&
                  cloneElement(headingIcon, {
                    className: StyleHelper.mergeStyles('size-6 text-green', headingIcon.props?.className),
                  })}
                {heading && <h2 className="text-sm">{heading}</h2>}
              </div>

              {withClose && (
                <IconButton
                  icon={<MdClose aria-hidden className="fill-white" />}
                  size="md"
                  compacted
                  loading={onErase ? isErasing : false}
                  onClick={startErase}
                />
              )}
            </div>

            <Separator />
          </header>

          <main className={StyleHelper.mergeStyles('min-h-0 min-w-0 grow px-4 py-8', contentClassName)}>
            {children}
          </main>
        </div>
      </motion.div>
    </FocusScope>
  )
}
