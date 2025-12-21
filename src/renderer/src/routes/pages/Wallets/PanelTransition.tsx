import { type ComponentProps, useContext, useLayoutEffect } from 'react'

import { type AnimationPlaybackControlsWithThen, motion, PresenceContext, useAnimate, usePresence } from 'motion/react'

import { StyleHelper } from '@renderer/helpers/StyleHelper'

type TProps = ComponentProps<typeof motion.section>

export const PanelTransition = ({ className, ...props }: TProps) => {
  const [scope, animate] = useAnimate()
  const [isPresent, safeToRemove] = usePresence()

  const presenceContext = useContext(PresenceContext)

  useLayoutEffect(() => {
    const element = scope.current as HTMLElement | null

    if (!element || presenceContext?.initial === false) return

    let animation: AnimationPlaybackControlsWithThen

    if (isPresent) {
      element.style.zIndex = '1'

      animation = animate(
        element,
        {
          y: [null, -16, 0],
          scale: [null, 0.98, 1],
          opacity: [null, 0.85, 1],
        },
        {
          duration: 0.5,
          times: [0, 0.5, 1],
        }
      )
    } else {
      element.style.zIndex = '2'

      animation = animate(
        element,
        {
          y: [null, 8, 8, 8],
          scale: [null, null, 0.97],
          opacity: [null, null, null, 0],
        },
        {
          duration: 0.5,
          times: [0, 0.5, 0.6, 1],
          onUpdate: () => {
            if (animation.time >= 0.3) {
              element.style.zIndex = '0'
            }
          },
          onComplete: () => {
            safeToRemove()
          },
        }
      )
    }

    return () => {
      animation.stop()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPresent])

  return <motion.section className={StyleHelper.mergeStyles('absolute inset-0', className)} {...props} ref={scope} />
}
