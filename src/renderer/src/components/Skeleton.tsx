import { ComponentProps } from 'react'
import { StyleHelper } from '@renderer/helpers/StyleHelper'

export const Skeleton = ({ className, ...props }: ComponentProps<'div'>) => (
  <span
    className={StyleHelper.mergeStyles('block h-2 w-full animate-pulse rounded bg-gray-700', className)}
    {...props}
  />
)
