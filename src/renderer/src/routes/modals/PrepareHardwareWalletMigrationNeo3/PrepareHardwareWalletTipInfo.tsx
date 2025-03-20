import { ReactNode } from 'react'
import { TbArrowRight } from 'react-icons/tb'
import { StyleHelper } from '@renderer/helpers/StyleHelper'

type TProps = {
  className?: string
  children: ReactNode
}

export const PrepareHardwareWalletTipInfo = ({ className, children }: TProps) => (
  <div className={StyleHelper.mergeStyles('flex gap-x-3 w-full', className)}>
    <TbArrowRight aria-hidden={true} className="text-gray-300 w-6 h-6" />
    {children}
  </div>
)
