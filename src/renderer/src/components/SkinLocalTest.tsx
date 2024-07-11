import { ComponentProps } from 'react'
import { StyleHelper } from '@renderer/helpers/StyleHelper'

export const SkinLocalTest = ({ className, ...props }: ComponentProps<'div'>) => {
  return <div className={StyleHelper.mergeStyles('bg-[red]', className)} {...props} />
}
