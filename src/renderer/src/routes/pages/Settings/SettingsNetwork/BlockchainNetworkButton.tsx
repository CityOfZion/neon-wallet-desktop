import { MdChevronRight } from 'react-icons/md'
import { StyleHelper } from '@renderer/helpers/StyleHelper'

type TProps = {
  label: string
  subLabel: string
  onClick?(): void
  className?: string
}

export const BlockchainNetworkButton = ({ label, subLabel, onClick, className }: TProps) => {
  return (
    <button
      className={StyleHelper.mergeStyles(
        'text-xs flex items-center py-2.5 justify-between px-1 aria-[disabled=false]:text-gray-300 h-fit hover:opacity-75 w-full border-b border-gray-300/30',
        className
      )}
      onClick={onClick}
    >
      <div className="flex items-center gap-2.5">
        <div className="w-6 h-6 flex items-center justify-center">
          <span className="w-1 h-1 rounded-full bg-gray-300" />
        </div>

        <span className="text-gray-100">{label}</span>
      </div>

      <div className="flex items-center gap-5">
        <span className="text-xs text-gray-300">{subLabel}</span>
        <MdChevronRight className="h-6 w-6 text-neon" />
      </div>
    </button>
  )
}
