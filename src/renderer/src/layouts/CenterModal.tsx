import { cloneElement, ComponentProps, type JSX, type MouseEvent, ReactNode, useLayoutEffect } from 'react'

import { motion, useAnimate } from 'motion/react'
import { useHotkeys } from 'react-hotkeys-hook'

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
  headerClassName?: string
  headerComponent?: ReactNode
  headingIcon?: JSX.Element
  heading?: JSX.Element | string
  onErase?: () => Promise<void> | void
  size?: TCenterModalSize
  closeOnEsc?: boolean
  closeOnClickOutside?: boolean
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

export const CenterModalLayout = ({
  children,
  contentClassName,
  className,
  headerComponent,
  headerClassName,
  heading,
  headingIcon,
  size = 'sm',
  onErase,
  closeOnClickOutside = true,
  closeOnEsc = true,
  ...props
}: TCenterModalLayoutProps) => {
  const { modalNavigateWrapper, modalErase } = useModalNavigate()
  const { groupIndex, isFocused, isGroupFocused } = useModalCurrentHistory()

  const [scope, animate] = useAnimate<HTMLDivElement>()

  const [isErasing, startErase] = usePressOnce(async () => {
    await onErase?.()
    modalErase()
  })

  const withHeading = headingIcon || heading
  const height = heightBySizes[size ?? 'xs']
  const width = widthBySizes[size ?? 'xs']

  const handleClickContent = (event: MouseEvent<HTMLDivElement>) => {
    event.stopPropagation()
  }

  const handleClickContainer = () => {
    if (!closeOnClickOutside) return
    startErase()
  }

  useLayoutEffect(() => {
    animate(scope.current, { opacity: isGroupFocused ? 1 : 0 }, { duration: 0.2 })
  }, [animate, isGroupFocused, scope])

  useHotkeys('esc', startErase, { enableOnFormTags: true, enabled: closeOnEsc && !isErasing && isFocused })

  return (
    <div
      className={StyleHelper.mergeStyles('flex h-full w-full items-center justify-center', {
        'pointer-events-none': isErasing,
      })}
      onClick={handleClickContainer}
    >
      <motion.div
        style={{ width, height }}
        initial={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
        animate={{ opacity: 1, scale: 1, transition: { duration: 0.2 } }}
        exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2, delay: 0.1 } }}
        ref={scope}
        onClick={handleClickContent}
        transition={{ duration: 0.2 }}
      >
        <div
          {...props}
          className={StyleHelper.mergeStyles(
            'flex h-full w-full flex-col overflow-y-auto rounded-md bg-gray-800 px-4',
            className
          )}
        >
          {headerComponent ?? (
            <header className={StyleHelper.mergeStyles('flex items-center pt-5 pb-2.5', headerClassName)}>
              <div className="flex grow items-center gap-2.5">
                {groupIndex > 0 && (
                  <IconButton
                    icon={<MdKeyboardBackspace aria-hidden className="fill-gray-200" />}
                    size="md"
                    compacted
                    onClick={modalNavigateWrapper(-1)}
                  />
                )}

                {withHeading && (
                  <div className="flex items-center gap-x-2.5">
                    {headingIcon &&
                      cloneElement(headingIcon, {
                        className: StyleHelper.mergeStyles('w-6 h-6 text-green', headingIcon.props?.className ?? ''),
                      })}

                    {heading && <h2 className="text-sm text-white">{heading}</h2>}
                  </div>
                )}
              </div>

              <IconButton
                icon={<MdClose aria-hidden className="text-gray-100" />}
                size="md"
                compacted
                loading={onErase ? isErasing : false}
                onClick={startErase}
                {...TestHelper.buildTestObject('center-modal-close-button')}
              />
            </header>
          )}

          {withHeading && <Separator />}

          <main className={StyleHelper.mergeStyles('my-2 min-h-0 grow px-9 pt-0.5 pb-8', contentClassName)}>
            {children}
          </main>
        </div>
      </motion.div>
    </div>
  )
}
