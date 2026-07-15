import { ReactNode } from 'react'

import { useTranslation } from 'react-i18next'

import { BlockchainServiceHelper } from '@renderer/helpers/BlockchainServiceHelper'
import { StyleHelper } from '@renderer/helpers/StyleHelper'
import { TestHelper } from '@renderer/helpers/TestHelper'

import { TBlockchainServiceKey } from '@shared/types/blockchain'

import { BlockchainIcon } from './BlockchainIcon'
import { Checkbox } from './Checkbox'
import { RadioGroup } from './RadioGroup'

type TItemProps = {
  blockchain: TBlockchainServiceKey
  children: ReactNode
}

type TProps = {
  selectedBlockchains?: TBlockchainServiceKey[]
  isMulti?: boolean
  blockchains?: TBlockchainServiceKey[]
  className?: string
  onSelect: (blockchains: TBlockchainServiceKey[]) => void
}

const Item = ({ blockchain, children }: TItemProps) => {
  const { t: tCommonBlockchain } = useTranslation('common', { keyPrefix: 'blockchain' })

  return (
    <label className="bg-asphalt flex h-11 w-full cursor-pointer items-center gap-2 rounded-sm px-4">
      <BlockchainIcon blockchain={blockchain} className="text-gray-100" />
      <span className="flex grow">{tCommonBlockchain(blockchain)}</span>

      {children}
    </label>
  )
}

export const BlockchainList = ({ onSelect, selectedBlockchains = [], isMulti, blockchains, className }: TProps) => {
  const blockchainsToIterate = blockchains || BlockchainServiceHelper.blockchainNames
  const internalClassName = StyleHelper.mergeStyles(
    'm-auto mb-4 flex w-1/2 grow flex-col gap-2 overflow-auto',
    className
  )

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

  return isMulti ? (
    <ul className={internalClassName} {...TestHelper.buildTestObject('blockchains-list')}>
      {blockchainsToIterate.map(blockchain => {
        const isSelected = selectedBlockchains.includes(blockchain)

        return (
          <li key={blockchain}>
            <Item blockchain={blockchain}>
              <Checkbox
                name={blockchain}
                onCheckedChange={() => handleSelect(blockchain)}
                checked={isSelected}
                className="rounded-sm"
              />
            </Item>
          </li>
        )
      })}
    </ul>
  ) : (
    <RadioGroup.Group
      value={selectedBlockchains[0]}
      onValueChange={value => handleSelect(value as TBlockchainServiceKey)}
      className={internalClassName}
      {...TestHelper.buildTestObject('blockchains-list')}
    >
      {blockchainsToIterate.map(blockchain => (
        <Item key={blockchain} blockchain={blockchain}>
          <RadioGroup.Item
            value={blockchain}
            withSeparator={false}
            className="group flex w-fit items-center justify-center"
          >
            <RadioGroup.Indicator />
          </RadioGroup.Item>
        </Item>
      ))}
    </RadioGroup.Group>
  )
}
