import { IconBaseProps } from 'react-icons'
import { TbRosetteDiscountCheck } from 'react-icons/tb'
import { StyleHelper } from '@renderer/helpers/StyleHelper'

export const SuccessIcon = ({ className, ...props }: IconBaseProps) => (
  <TbRosetteDiscountCheck
    className={StyleHelper.mergeStyles(
      'text-blue stroke-1 bg-asphalt rounded-[50%] p-1.5 mt-8 w-[118px] h-[118px]',
      className
    )}
    aria-hidden={true}
    {...props}
  />
)
