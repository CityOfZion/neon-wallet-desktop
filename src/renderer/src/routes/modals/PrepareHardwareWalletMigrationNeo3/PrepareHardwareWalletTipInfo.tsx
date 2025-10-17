import { ReactNode } from 'react'

import { StyleHelper } from '@renderer/helpers/StyleHelper'

import TbArrowRight from '@renderer/assets/images/tb-arrow-right.svg?react'

type TProps = {
  className?: string
  children: ReactNode
}

export const PrepareHardwareWalletTipInfo = ({ className, children }: TProps) => (
  <div className={StyleHelper.mergeStyles('flex w-full gap-x-3', className)}>
    <TbArrowRight aria-hidden className="h-6 w-6 text-gray-300" />
    {children}
  </div>
)
