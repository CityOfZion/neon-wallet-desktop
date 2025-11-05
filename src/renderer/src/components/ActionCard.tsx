import { ReactNode } from 'react'

import { StyleHelper } from '@renderer/helpers/StyleHelper'

type TProps = {
  children: ReactNode
  className?: string
}

export const ActionCard = ({ children, className }: TProps) => (
  <div className={StyleHelper.mergeStyles('flex w-full flex-col rounded-sm bg-gray-700/60 px-4', className)}>
    {children}
  </div>
)
