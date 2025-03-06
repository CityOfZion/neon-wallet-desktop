import { ReactNode } from 'react'
import { StyleHelper } from '@renderer/helpers/StyleHelper'

type TProps = {
  children: ReactNode
  className?: string
}

export const ActionCard = ({ children, className }: TProps) => (
  <div className={StyleHelper.mergeStyles('flex flex-col bg-gray-700/60 px-4 w-full rounded', className)}>
    {children}
  </div>
)
