import { TbArrowDown } from 'react-icons/tb'

export const ActionStepSeparator = () => (
  <div className="relative z-10">
    <TbArrowDown
      aria-hidden={true}
      className="w-5 h-5 p-1 bg-gray-600 rounded-full border-8 border-gray-800 box-content absolute top-2 left-1/2 -translate-x-1/2 -translate-y-1/2"
    />
  </div>
)
