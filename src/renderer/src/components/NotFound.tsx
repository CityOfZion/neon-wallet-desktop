import { StyleHelper } from '@renderer/helpers/StyleHelper'

import NotFoundIcon from '@renderer/assets/images/not-found.svg?react'

type TProps = {
  title: string
  description: string
  className?: string
}

export const NotFound = ({ title, description, className }: TProps) => (
  <div className={StyleHelper.mergeStyles('flex flex-col p-4 text-center text-sm', className)}>
    <div className="my-auto flex flex-col items-center justify-center gap-y-1">
      <NotFoundIcon aria-hidden className="text-blue min-size-16 max-size-16 mx-auto size-16" />

      <div className="flex flex-col">
        <p className="text-white">{title}</p>

        <p className="text-xs text-gray-300">{description}</p>
      </div>
    </div>
  </div>
)
