import { ReactComponent as ArrowRightBoldOutlineIcon } from '@renderer/assets/images/arrow-right-bold-outline-icon.svg'
import { animate, motion, useMotionValue } from 'framer-motion'

type TProps = {
  text: string
  buttonAriaLabel: string
  onComplete: () => void
}

const WIDTH = 300
const DRAG_WIDTH = 64
const HALF_DRAG_WIDTH = DRAG_WIDTH / 2
const HALF = '50%'
const MAX = WIDTH - DRAG_WIDTH
const REST_SIZE = -MAX
const DURATION = 0.4

export const Swipe = ({ text, buttonAriaLabel, onComplete }: TProps) => {
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
      className={'bg-gray-300/30 text-white text-sm relative rounded h-[48px] overflow-hidden'}
    >
      <motion.div
        style={{
          x: motionValue,
          touchAction: 'none',
          boxShadow: '4px 8px 20px 0px #12151766, 1px 1px 0px 0px #D6D2D223 inset, -1px -1px 0px 0px #00000051 inset',
        }}
        className={'flex justify-end bg-pink rounded h-[inherit] relative z-[1] w-full'}
        tabIndex={0}
        role={'button'}
        aria-label={buttonAriaLabel}
        dragMomentum={false}
        dragTransition={{ max: 0, min: REST_SIZE }}
        dragConstraints={{ left: REST_SIZE, right: 0 }}
        dragElastic={0}
        drag={'x'}
        onDragEnd={handleDragEnd}
        onKeyDown={handleKeyDown}
      >
        <div
          style={{ width: `${DRAG_WIDTH}px` }}
          className={'flex items-center h-[inherit] cursor-pointer flex items-center justify-center'}
        >
          <ArrowRightBoldOutlineIcon aria-hidden={true} className={'w-6 h-6 pointer-events-none'} />
        </div>
      </motion.div>
      <p
        style={{ left: `calc(${HALF} + ${HALF_DRAG_WIDTH}px)`, transform: `translate(-${HALF}, -${HALF})`, width: MAX }}
        className={'absolute text-center top-1/2'}
      >
        {text}
      </p>
    </div>
  )
}
