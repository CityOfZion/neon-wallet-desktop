import { ComponentProps } from 'react'
import ArrowRightBoldOutlineIcon from '@renderer/assets/images/arrow-right-bold-outline-icon.svg?react'
import { animate, motion, useMotionValue } from 'framer-motion'

type TProps = {
  text: string
  buttonAriaLabel: string
  onComplete: () => void
} & ComponentProps<typeof motion.div>

const WIDTH = 300
const DRAG_WIDTH = 64
const HALF_DRAG_WIDTH = DRAG_WIDTH / 2
const HALF = '50%'
const MAX = WIDTH - DRAG_WIDTH
const REST_SIZE = -MAX
const DURATION = 0.4

export const Swipe = ({ text, buttonAriaLabel, onComplete, ...props }: TProps) => {
  const motionValue = useMotionValue(REST_SIZE)

  const handleDragEnd = () => {
    const value = motionValue.get()

    if (value !== 0) animate(motionValue, REST_SIZE, { type: 'spring', duration: DURATION })
    else onComplete()
  }

  const handleKeyDown = async ({ code }) => {
    if (code !== 'Space' && code !== 'Enter') return

    await animate(motionValue, 0, { type: 'keyframes', duration: DURATION })

    onComplete()
  }

  return (
    <div
      style={{ width: `${WIDTH}px` }}
      className="relative h-[48px] overflow-hidden rounded bg-gray-300/30 text-sm text-white"
    >
      <motion.div
        style={{
          x: motionValue,
          touchAction: 'none',
          boxShadow: '4px 8px 20px 0px #12151766, 1px 1px 0px 0px #D6D2D223 inset, -1px -1px 0px 0px #00000051 inset',
        }}
        className="relative z-[1] flex h-[inherit] w-full justify-end rounded bg-pink"
        tabIndex={0}
        role="button"
        aria-label={buttonAriaLabel}
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
          <ArrowRightBoldOutlineIcon aria-hidden={true} className="pointer-events-none h-6 w-6" />
        </div>
      </motion.div>
      <p
        style={{ left: `calc(${HALF} + ${HALF_DRAG_WIDTH}px)`, transform: `translate(-${HALF}, -${HALF})`, width: MAX }}
        className="absolute top-1/2 text-center"
      >
        {text}
      </p>
    </div>
  )
}
