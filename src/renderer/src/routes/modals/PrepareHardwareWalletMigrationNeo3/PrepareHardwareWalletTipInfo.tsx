import { ReactNode } from 'react'
import { TbArrowRight } from 'react-icons/tb'
import { StyleHelper } from '@renderer/helpers/StyleHelper'

type TProps = {
  className?: string
  children: ReactNode
}

export const PrepareHardwareWalletTipInfo = ({ className, children }: TProps) => (
  <div className={StyleHelper.mergeStyles('flex w-full gap-x-3', className)}>
    <TbArrowRight aria-hidden={true} className="h-6 w-6 text-gray-300" />
    {children}
  </div>
)
