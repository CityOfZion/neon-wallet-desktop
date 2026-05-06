import { cloneElement, ComponentProps, type JSX, type MouseEvent, ReactNode, useLayoutEffect } from 'react'

import { FocusScope } from '@radix-ui/react-focus-scope'
import { motion, useAnimate } from 'motion/react'
import { useHotkeys } from 'react-hotkeys-hook'
import { useTranslation } from 'react-i18next'

import { IconButton } from '@renderer/components/IconButton'
import { Separator } from '@renderer/components/Separator'

import { StyleHelper } from '@renderer/helpers/StyleHelper'
import { TestHelper } from '@renderer/helpers/TestHelper'

import { useModalCurrentHistory, useModalNavigate } from '@renderer/hooks/useModalRouter'
import { usePressOnce } from '@renderer/hooks/usePressOnce'

import MdClose from '@renderer/assets/images/md-close.svg?react'
import MdKeyboardBackspace from '@renderer/assets/images/md-keyboard-backspace.svg?react'

type TCenterModalSize = 'xs' | 'sm' | 'lg'

type TCenterModalLayoutProps = {
  contentClassName?: string
  heading?: JSX.Element | string
  headingIcon?: JSX.Element
  headerClassName?: string
  headerComponent?: ReactNode
  size?: TCenterModalSize
  withErase?: boolean
  eraseOnEsc?: boolean
  eraseOnClickOutside?: boolean
  onErase?: () => Promise<void> | void
} & ComponentProps<'div'>

const widthBySizes: Record<TCenterModalSize, string> = {
  xs: '24rem',
  sm: '32rem',
  lg: '53rem',
}

const heightBySizes: Record<TCenterModalSize, string> = {
  xs: 'auto',
  sm: '38.75rem',
  lg: '38.75rem',
}

const DURATION = 0.2

export const CenterModalLayout = ({
  className,
  contentClassName,
  heading,
  headingIcon,
  headerClassName,
  headerComponent,
  size = 'sm',
  withErase = true,
  eraseOnEsc = true,
  eraseOnClickOutside = true,
  onErase,
  children,
  ...props
}: TCenterModalLayoutProps) => {
  const { t: tCommonGeneral } = useTranslation('common', { keyPrefix: 'general' })
  const { modalNavigateWrapper, modalErase } = useModalNavigate()
  const { groupIndex, isFocused, isGroupFocused } = useModalCurrentHistory()

  const [scope, animate] = useAnimate<HTMLDivElement>()

  const [isErasing, startErase] = usePressOnce(async () => {
    if (onErase) await onErase()

    modalErase()
  })

  const withHeading = !!(headingIcon || heading)
  const height = heightBySizes[size]
  const width = widthBySizes[size]

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
      className={StyleHelper.mergeStyles('flex size-full items-center justify-center', {
        'pointer-events-none': isErasing,
      })}
      onClick={handleClickContainer}
    >
      <motion.div
        ref={scope}
        style={{ width, height }}
        transition={{ duration: DURATION }}
        initial={{ opacity: 0, scale: 0.95, transition: { duration: DURATION } }}
        animate={{ opacity: 1, scale: 1, transition: { duration: DURATION } }}
        exit={{ opacity: 0, scale: 0.95, transition: { duration: DURATION, delay: 0.1 } }}
        onClick={handleClickContent}
      >
        <div
          {...props}
          className={StyleHelper.mergeStyles(
            'flex size-full flex-col overflow-y-auto rounded-md bg-gray-800 px-4',
            className
          )}
        >
          {headerComponent || (
            <header className={StyleHelper.mergeStyles('flex items-center pt-5 pb-2.5', headerClassName)}>
              <div className="flex grow items-center gap-2">
                {groupIndex > 0 && (
                  <IconButton
                    aria-label={tCommonGeneral('back')}
                    icon={<MdKeyboardBackspace aria-hidden className="fill-gray-200" />}
                    size="md"
                    compacted
                    onClick={modalNavigateWrapper(-1)}
                  />
                )}

                {withHeading && (
                  <div className="flex items-center gap-x-2">
                    {headingIcon &&
                      cloneElement(headingIcon, {
                        className: StyleHelper.mergeStyles('size-6 text-green', headingIcon.props?.className),
                      })}

                    {heading && <h2 className="text-sm text-white">{heading}</h2>}
                  </div>
                )}
              </div>

              {withErase && (
                <IconButton
                  aria-label={tCommonGeneral('close')}
                  icon={<MdClose aria-hidden className="text-gray-100" />}
                  size="md"
                  compacted
                  loading={isErasing}
                  onClick={startErase}
                  {...TestHelper.buildTestObject('center-modal-erase-button')}
                />
              )}
            </header>
          )}

          {withHeading && <Separator />}

          <main className={StyleHelper.mergeStyles('my-2 min-h-0 grow px-9 pt-0.5 pb-8', contentClassName)}>
            {children}
          </main>
        </div>
      </motion.div>
    </FocusScope>
  )
}
