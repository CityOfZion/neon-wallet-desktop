import { useTranslation } from 'react-i18next'

import { BlockchainServiceHelper } from '@renderer/helpers/BlockchainServiceHelper'
import { StyleHelper } from '@renderer/helpers/StyleHelper'
import { TestHelper } from '@renderer/helpers/TestHelper'

import { TBlockchainServiceKey } from '@shared/types/blockchain'

import { BlockchainIcon } from './BlockchainIcon'
import { Checkbox } from './Checkbox'

type TProps = {
  selectedBlockchains?: TBlockchainServiceKey[]
  isMulti?: boolean
  blockchains?: TBlockchainServiceKey[]
  className?: string
  onSelect: (blockchains: TBlockchainServiceKey[]) => void
}

export const BlockchainList = ({ onSelect, selectedBlockchains = [], isMulti, blockchains, className }: TProps) => {
  const { t: tCommonBlockchain } = useTranslation('common', { keyPrefix: 'blockchain' })

  const blockchainsToIterate = blockchains ?? BlockchainServiceHelper.blockchainNames

  const handleSelect = (blockchain: TBlockchainServiceKey) => {
    if (isMulti) {
      onSelect(
        selectedBlockchains.includes(blockchain)
          ? selectedBlockchains.filter(selectedBlockchain => selectedBlockchain !== blockchain)
          : [...selectedBlockchains, blockchain]
      )
      return
    }

    onSelect([blockchain])
  }

  return (
    <ul
      className={StyleHelper.mergeStyles('m-auto mb-4 flex w-1/2 grow flex-col gap-2 overflow-auto', className)}
      {...TestHelper.buildTestObject('blockchains-list')}
    >
      {blockchainsToIterate.map(blockchain => {
        const isSelected = selectedBlockchains.includes(blockchain)

        return (
          <li key={blockchain} className="bg-asphalt flex h-12 grow items-center rounded-sm border-none">
            <label className="flex w-full cursor-pointer items-center gap-2.5 px-6 py-4">
              <BlockchainIcon blockchain={blockchain} type="gray" />
              <span className="flex grow">{tCommonBlockchain(blockchain)}</span>
              <Checkbox
                value={blockchain}
                onCheckedChange={() => handleSelect(blockchain)}
                checked={isSelected}
                className="rounded-sm"
              />
            </label>
          </li>
        )
      })}
    </ul>
  )
}
