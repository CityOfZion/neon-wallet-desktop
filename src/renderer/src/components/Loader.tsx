import { TbLoader2 } from 'react-icons/tb'
import { StyleHelper } from '@renderer/helpers/StyleHelper'

type TProps = {
  containerClassName?: string
  className?: string
}

export const Loader = ({ containerClassName, className }: TProps) => {
  return (
    <div className={StyleHelper.mergeStyles('flex w-full justify-center', containerClassName)}>
      <TbLoader2 aria-hidden={true} className={StyleHelper.mergeStyles('h-6 w-6 animate-spin', className)} />
    </div>
  )
}
