import { SVGProps } from 'react'
import TbRosetteDiscountCheck from '@renderer/assets/images/tb-rosette-discount-check.svg?react'
import { StyleHelper } from '@renderer/helpers/StyleHelper'

export const SuccessIcon = ({ className, ...props }: SVGProps<SVGSVGElement>) => (
  <TbRosetteDiscountCheck
    className={StyleHelper.mergeStyles(
      'mt-8 h-[118px] w-[118px] rounded-[50%] bg-asphalt stroke-1 p-1.5 text-blue',
      className
    )}
    aria-hidden={true}
    {...props}
  />
)
