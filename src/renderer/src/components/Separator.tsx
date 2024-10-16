import { ComponentProps } from 'react'
import { StyleHelper } from '@renderer/helpers/StyleHelper'

type TProps = ComponentProps<'div'> & {
  containerClassName?: string
}

export const Separator = ({ className, containerClassName, ...props }: TProps) => {
  return (
    <div className={StyleHelper.mergeStyles('w-full', containerClassName)}>
      <div className={StyleHelper.mergeStyles('w-full h-px bg-gray-300/15 min-h-[0.0625rem]', className)} {...props} />
    </div>
  )
}
