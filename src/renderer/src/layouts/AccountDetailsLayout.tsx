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
      className={StyleHelper.mergeStyles('flex min-h-0 w-full min-w-0 flex-grow flex-col px-4 py-3', className)}
      {...props}
    >
      <div className="mb-3 flex h-7 max-h-7 min-h-7 items-center justify-between text-sm">
        {typeof heading === 'string' ? <h1 className="text-sm text-white">{heading}</h1> : heading}

        {actions}
      </div>

      <Separator />

      <div className="flex w-full flex-grow flex-col overflow-y-auto">{children}</div>
    </div>
  )
}
