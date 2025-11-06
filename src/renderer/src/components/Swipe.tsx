import { ComponentProps } from 'react'

import { animate, motion, useMotionValue } from 'motion/react'

import { StyleHelper } from '@renderer/helpers/StyleHelper'

import ArrowRightBoldOutlineIcon from '@renderer/assets/images/arrow-right-bold-outline-icon.svg?react'

type TProps = {
  text: string
  buttonAriaLabel: string
  isDisabled?: boolean
  onComplete: () => void
} & ComponentProps<typeof motion.div>

const WIDTH = 300
const DRAG_WIDTH = 64
const HALF_DRAG_WIDTH = DRAG_WIDTH / 2
const HALF = '50%'
const MAX = WIDTH - DRAG_WIDTH
const REST_SIZE = -MAX
const DURATION = 0.4

export const Swipe = ({ text, buttonAriaLabel, isDisabled = false, onComplete, ...props }: TProps) => {
  const motionValue = useMotionValue(REST_SIZE)

  const handleDragEnd = () => {
    if (isDisabled) return

    const value = motionValue.get()

    if (value !== 0) animate(motionValue, REST_SIZE, { type: 'spring', duration: DURATION })
    else onComplete()
  }

  const handleKeyDown = async ({ code }) => {
    if (isDisabled) return
    if (code !== 'Space' && code !== 'Enter') return

    await animate(motionValue, 0, { type: 'keyframes', duration: DURATION })

    onComplete()
  }

  return (
    <div
      style={{ width: `${WIDTH}px` }}
      className="relative h-12 overflow-hidden rounded-sm bg-gray-300/30 text-sm text-white"
    >
      <motion.div
        style={{
          x: motionValue,
          touchAction: 'none',
          boxShadow: '4px 8px 20px 0px #12151766, 1px 1px 0px 0px #D6D2D223 inset, -1px -1px 0px 0px #00000051 inset',
        }}
        className={StyleHelper.mergeStyles('bg-pink relative z-1 flex h-[inherit] w-full justify-end rounded-sm', {
          'pointer-events-none': isDisabled,
        })}
        tabIndex={0}
        role="button"
        aria-label={buttonAriaLabel}
        aria-disabled={isDisabled}
        dragMomentum={false}
        dragTransition={{ max: 0, min: REST_SIZE }}
        dragConstraints={{ left: REST_SIZE, right: 0 }}
        dragElastic={0}
        drag="x"
        onDragEnd={handleDragEnd}
        onKeyDown={handleKeyDown}
        {...props}
      >
        <div
          style={{ width: `${DRAG_WIDTH}px` }}
          className="flex h-[inherit] cursor-pointer items-center justify-center"
        >
          <ArrowRightBoldOutlineIcon aria-hidden className="pointer-events-none size-6" />
        </div>
      </motion.div>
      <p
        style={{ left: `calc(${HALF} + ${HALF_DRAG_WIDTH}px)`, transform: `translate(-${HALF}, -${HALF})`, width: MAX }}
        className="pointer-events-none absolute top-1/2 px-4 text-center"
      >
        {text}
      </p>
    </div>
  )
}
