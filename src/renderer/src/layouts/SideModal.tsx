import { cloneElement, ComponentProps, type JSX, type MouseEvent, useLayoutEffect } from 'react'

import { FocusScope } from '@radix-ui/react-focus-scope'
import { motion, useAnimate } from 'motion/react'
import { useHotkeys } from 'react-hotkeys-hook'
import { useTranslation } from 'react-i18next'

import { IconButton } from '@renderer/components/IconButton'
import { Separator } from '@renderer/components/Separator'

import { StyleHelper } from '@renderer/helpers/StyleHelper'

import { useModalCurrentHistory, useModalNavigate } from '@renderer/hooks/useModalRouter'
import { usePressOnce } from '@renderer/hooks/usePressOnce'

import MdClose from '@renderer/assets/images/md-close.svg?react'
import MdKeyboardBackspace from '@renderer/assets/images/md-keyboard-backspace.svg?react'

export type TSideModalSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '1xl'

export type TSideModalLayoutProps = {
  contentClassName?: string
  heading?: JSX.Element | string
  headingIcon?: JSX.Element
  size?: TSideModalSize
  withErase?: boolean
  eraseOnEsc?: boolean
  eraseOnClickOutside?: boolean
  onErase?: () => Promise<void> | void
  onBack?: () => Promise<void> | void
} & ComponentProps<'div'>

const widthBySizes: Record<TSideModalSize, number> = {
  xs: 224,
  sm: 330,
  md: 414,
  lg: 512,
  xl: 720,
  '1xl': 1000,
}

const DURATION = 0.2

export const SideModalLayout = ({
  className,
  contentClassName,
  heading,
  headingIcon,
  size = 'sm',
  withErase = true,
  eraseOnEsc = true,
  eraseOnClickOutside = true,
  onErase,
  onBack,
  children,
  ...props
}: TSideModalLayoutProps) => {
  const { t: tCommonGeneral } = useTranslation('common', { keyPrefix: 'general' })
  const { modalErase, modalNavigate } = useModalNavigate()
  const { groupIndex, isFocused, isGroupFocused } = useModalCurrentHistory()

  const [scope, animate] = useAnimate<HTMLDivElement>()

  const width = widthBySizes[size]

  const [isErasing, startErase] = usePressOnce(async () => {
    if (onErase) await onErase()

    modalErase()
  })

  const [isBacking, startBack] = usePressOnce(async () => {
    await onBack?.()

    modalNavigate(-1)
  })

  const handleClickContent = (event: MouseEvent<HTMLDivElement>) => {
    event.stopPropagation()
  }

  const handleClickContainer = () => {
    if (!eraseOnClickOutside) return

    startErase()
  }

  useLayoutEffect(() => {
    animate(scope.current, { opacity: isGroupFocused ? 1 : 0 }, { duration: DURATION })
  }, [animate, isGroupFocused, scope])

  useHotkeys('esc', startErase, { enabled: eraseOnEsc && !isErasing && isFocused })

  return (
    <FocusScope
      loop
      className={StyleHelper.mergeStyles('flex h-full w-full justify-end', {
        'pointer-events-none': isErasing,
      })}
      onClick={handleClickContainer}
    >
      <motion.div
        ref={scope}
        className="relative h-full"
        initial={{ width: 0, opacity: 0, transition: { duration: DURATION } }}
        animate={{ width, opacity: 1, transition: { duration: DURATION } }}
        exit={{ width: 0, opacity: 0, transition: { duration: DURATION, delay: 0.1 } }}
        onClick={handleClickContent}
      >
        <div
          className={StyleHelper.mergeStyles('flex h-full flex-col bg-gray-800 text-xs text-white', className)}
          style={{ minWidth: width, ...props.style }}
          {...props}
        >
          <header className="flex flex-col px-4">
            <div className="flex items-center justify-between py-2.5">
              {groupIndex > 0 && (
                <IconButton
                  aria-label={tCommonGeneral('back')}
                  icon={<MdKeyboardBackspace aria-hidden className="fill-gray-200" />}
                  size="md"
                  compacted
                  loading={isBacking}
                  onClick={startBack}
                />
              )}

              <div className="flex items-center gap-x-2">
                {headingIcon &&
                  cloneElement(headingIcon, {
                    className: StyleHelper.mergeStyles('size-6 text-green', headingIcon.props?.className),
                  })}

                {heading && <h2 className="text-sm">{heading}</h2>}
              </div>

              {withErase && (
                <IconButton
                  aria-label={tCommonGeneral('close')}
                  icon={<MdClose aria-hidden className="fill-white" />}
                  size="md"
                  compacted
                  loading={isErasing}
                  onClick={startErase}
                />
              )}
            </div>

            <Separator />
          </header>

          <main className={StyleHelper.mergeStyles('min-size-0 grow px-4 py-8', contentClassName)}>{children}</main>
        </div>
      </motion.div>
    </FocusScope>
  )
}
