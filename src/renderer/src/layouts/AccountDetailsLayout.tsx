import { ComponentProps, ReactNode } from 'react'
import { Separator } from '@renderer/components/Separator'
import { StyleHelper } from '@renderer/helpers/StyleHelper'

type TProps = {
  heading: ReactNode
  actions?: JSX.Element
} & ComponentProps<'div'>

export const AccountDetailsLayout = ({ heading, actions, children, className, ...props }: TProps): JSX.Element => {
  return (
    <div
      className={StyleHelper.mergeStyles('w-full flex flex-col flex-grow px-4 py-3 min-h-0 min-w-0', className)}
      {...props}
    >
      <div className="flex justify-between items-center text-sm mb-3 max-h-7 min-h-7 h-7">
        {typeof heading === 'string' ? <h1 className="text-white text-sm">{heading}</h1> : heading}

        {actions}
      </div>

      <Separator />

      <div className="flex flex-col overflow-y-auto w-full flex-grow">{children}</div>
    </div>
  )
}
