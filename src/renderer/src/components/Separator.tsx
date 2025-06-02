import { ComponentProps } from 'react'
import { StyleHelper } from '@renderer/helpers/StyleHelper'

type TProps = ComponentProps<'div'> & {
  containerClassName?: string
  type?: 'vertical' | 'horizontal'
}

export const Separator = ({ className, containerClassName, type = 'horizontal', ...props }: TProps) => {
  return (
    <div
      className={StyleHelper.mergeStyles(
        {
          'w-full': type === 'horizontal',
          'h-full': type === 'vertical',
        },
        containerClassName
      )}
    >
      {type === 'horizontal' ? (
        <div
          className={StyleHelper.mergeStyles('h-px min-h-[0.0625rem] w-full bg-gray-300/15', className)}
          {...props}
        />
      ) : (
        <div
          className={StyleHelper.mergeStyles('h-full w-px min-w-[0.0625rem] bg-gray-300/15', className)}
          {...props}
        />
      )}
    </div>
  )
}
