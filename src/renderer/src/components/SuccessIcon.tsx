import { IconBaseProps } from 'react-icons'
import { TbRosetteDiscountCheck } from 'react-icons/tb'
import { StyleHelper } from '@renderer/helpers/StyleHelper'

export const SuccessIcon = ({ className, ...props }: IconBaseProps) => (
  <TbRosetteDiscountCheck
    className={StyleHelper.mergeStyles(
      'mt-8 h-[118px] w-[118px] rounded-[50%] bg-asphalt stroke-1 p-1.5 text-blue',
      className
    )}
    aria-hidden={true}
    {...props}
  />
)
