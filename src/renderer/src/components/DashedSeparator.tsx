import { StyleHelper } from '@renderer/helpers/StyleHelper'

type TProps = {
  className?: string
}

export const DashedSeparator = ({ className }: TProps) => (
  <div className={StyleHelper.mergeStyles('h-auto w-full border-t-2 border-dashed border-gray-300', className)} />
)
