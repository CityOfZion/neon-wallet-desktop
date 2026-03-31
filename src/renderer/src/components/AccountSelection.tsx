import { useTranslation } from 'react-i18next'

import { TBlockchainServiceKey } from '@shared/types/blockchain'

import { BlockchainIcon } from './BlockchainIcon'
import { Checkbox } from './Checkbox'
import { Separator } from './Separator'

type TRootProps = {
  blockchain: TBlockchainServiceKey
  children: React.ReactNode
}

type TItemProps = {
  onCheckedChange?(checked: boolean): void
  address: string
  label?: string
  checked?: boolean
  disabled?: boolean
}

const Root = ({ blockchain, children }: TRootProps) => {
  const { t: tCommonBlockchain } = useTranslation('common', { keyPrefix: 'blockchain' })

  return (
    <div className="bg-asphalt gap-y-4 rounded-sm p-2">
      <div className="flex items-center gap-x-2 p-2">
        <BlockchainIcon blockchain={blockchain} className="text-white" />
        {tCommonBlockchain(blockchain)}
      </div>

      <Separator />

      <ul className="flex w-full flex-col items-center justify-between gap-y-2 p-2">{children}</ul>
    </div>
  )
}

const Item = ({ onCheckedChange, address, label, checked, disabled }: TItemProps) => {
  return (
    <li className="flex w-full flex-col gap-y-0.5 text-xs text-white">
      <span className="text-gray-300">{label}</span>
      <div className="flex justify-between gap-x-2">
        <span className="block min-w-0 truncate">{address}</span>
        <Checkbox checked={checked} onCheckedChange={onCheckedChange} disabled={disabled} />
      </div>
    </li>
  )
}

export const AccountSelection = {
  Root,
  Item,
}
