import { motion } from 'motion/react'
import type { ComponentProps } from 'react'

import { StyleHelper } from '@renderer/helpers/StyleHelper'

const FIRST_PATH_LENGTH = 347.615
const SECOND_PATH_LENGTH = 139.654

type TProps = ComponentProps<'div'>

export const ScreenLoader = ({ className, ...props }: TProps) => {
  return (
    <div className={StyleHelper.mergeStyles('flex h-full w-full items-center justify-center', className)} {...props}>
      <svg viewBox="0 0 118 107" fill="none" className="h-32 w-32">
        <motion.path
          className="stroke-neon stroke-3"
          d="M52.9 103 4 54 52.9 5.1 65 17.3 77.3 5.1l12.3 12.2L101.9 5 114 17.3 89.6 41.8 101.9 54l-50.1 50.1"
          strokeDasharray={FIRST_PATH_LENGTH}
          initial={{ strokeDashoffset: FIRST_PATH_LENGTH }}
          animate={{
            strokeDashoffset: [FIRST_PATH_LENGTH, 0, 0, 0, FIRST_PATH_LENGTH],
          }}
          transition={{
            duration: 3,
            times: [0, 0.25, 0.5, 0.75],
            ease: 'linear',
            repeat: Infinity,
          }}
        />

        <motion.path
          className="stroke-neon stroke-3"
          d="M52.9 78.4 28.4 54l12.2-12.2L52.9 54l12.2-12.2L77.3 54 51.8 79.4"
          initial={{ strokeDashoffset: SECOND_PATH_LENGTH }}
          strokeDasharray={SECOND_PATH_LENGTH}
          animate={{
            strokeDashoffset: [SECOND_PATH_LENGTH, 0, SECOND_PATH_LENGTH, SECOND_PATH_LENGTH],
          }}
          transition={{
            duration: 3,
            times: [0.25, 0.5, 0.75, 1],
            ease: 'linear',
            repeat: Infinity,
          }}
        />
      </svg>
    </div>
  )
}
