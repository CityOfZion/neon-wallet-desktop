import { ComponentProps } from 'react'
import { StyleHelper } from '@renderer/helpers/StyleHelper'

export const Skeleton = ({ className, ...props }: ComponentProps<'div'>) => (
  <div className={StyleHelper.mergeStyles('h-2 w-full animate-pulse rounded bg-gray-700', className)} {...props} />
)
