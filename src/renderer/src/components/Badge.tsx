import { ComponentProps, ReactNode } from 'react'

import { StyleHelper } from '@renderer/helpers/StyleHelper'

type TProps = {
  children: ReactNode
} & ComponentProps<'span'>

export const Badge = ({ className, children, ...props }: TProps) => (
  <span
    className={StyleHelper.mergeStyles(
      'text-1xs bg-asphalt rounded-xs px-2 py-0.5 font-semibold tracking-wide text-white uppercase',
      className
    )}
    {...props}
  >
    {children}
  </span>
)
