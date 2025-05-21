import { ComponentProps } from 'react'
import { StyleHelper } from '@renderer/helpers/StyleHelper'

export const Skeleton = ({ className, ...props }: ComponentProps<'div'>) => (
  <div className={StyleHelper.mergeStyles('animate-pulse rounded bg-gray-700 w-full h-2', className)} {...props} />
)
