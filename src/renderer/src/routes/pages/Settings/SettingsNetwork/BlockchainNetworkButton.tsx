import { ComponentProps } from 'react'

import { StyleHelper } from '@renderer/helpers/StyleHelper'

import MdChevronRight from '@renderer/assets/images/md-chevron-right.svg?react'

type TProps = {
  label: string
  subLabel: string
  onClick?(): void
  className?: string
  disabled?: boolean
} & ComponentProps<'button'>

export const BlockchainNetworkButton = ({ label, subLabel, onClick, className, disabled, ...props }: TProps) => {
  return (
    <button
      aria-disabled={disabled}
      disabled={disabled}
      className={StyleHelper.mergeStyles(
        'flex h-fit w-full items-center justify-between border-b border-gray-300/30 px-1 py-2.5 text-xs aria-disabled:opacity-50 aria-[disabled=false]:text-gray-300 aria-[disabled=false]:hover:opacity-75',
        className
      )}
      onClick={onClick}
      {...props}
    >
      <div className="flex items-center gap-2.5">
        <div className="flex h-6 w-6 items-center justify-center">
          <span className="h-1 w-1 rounded-full bg-gray-300" />
        </div>

        <span className="text-gray-100">{label}</span>
      </div>

      <div className="flex items-center gap-5">
        <span className="text-xs text-gray-300">{subLabel}</span>
        <MdChevronRight aria-hidden className="text-neon size-6" />
      </div>
    </button>
  )
}
