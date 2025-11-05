import { StyleHelper } from '@renderer/helpers/StyleHelper'

import TbArrowDown from '@renderer/assets/images/tb-arrow-down.svg?react'

type TProps = { className?: string }

export const ActionStepSeparator = ({ className }: TProps) => (
  <div className="relative z-10">
    <TbArrowDown
      aria-hidden
      className={StyleHelper.mergeStyles(
        'absolute top-2 left-1/2 box-content h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-8 border-gray-800 bg-gray-600 p-1',
        className
      )}
    />
  </div>
)
