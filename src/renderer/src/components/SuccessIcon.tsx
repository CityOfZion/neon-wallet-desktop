import { SVGProps } from 'react'

import { StyleHelper } from '@renderer/helpers/StyleHelper'

import TbRosetteDiscountCheck from '@renderer/assets/images/tb-rosette-discount-check.svg?react'

export const SuccessIcon = ({ className, ...props }: SVGProps<SVGSVGElement>) => (
  <TbRosetteDiscountCheck
    className={StyleHelper.mergeStyles(
      'bg-asphalt text-blue mt-8 h-[118px] w-[118px] rounded-[50%] stroke-1 p-1.5',
      className
    )}
    aria-hidden
    {...props}
  />
)
