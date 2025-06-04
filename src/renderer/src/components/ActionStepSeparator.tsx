import { TbArrowDown } from 'react-icons/tb'
import { StyleHelper } from '@renderer/helpers/StyleHelper'

type TProps = { className?: string }

export const ActionStepSeparator = ({ className }: TProps) => (
  <div className="relative z-10">
    <TbArrowDown
      aria-hidden={true}
      className={StyleHelper.mergeStyles(
        'absolute left-1/2 top-2 box-content h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-8 border-gray-800 bg-gray-600 p-1',
        className
      )}
    />
  </div>
)
