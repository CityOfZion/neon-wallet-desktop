import { Fragment } from 'react'

import { useTranslation } from 'react-i18next'

import { BlockchainServiceHelper } from '@renderer/helpers/BlockchainServiceHelper'
import { StyleHelper } from '@renderer/helpers/StyleHelper'
import { TestHelper } from '@renderer/helpers/TestHelper'

import { TBlockchainServiceKey } from '@shared/types/blockchain'

import { BlockchainIcon } from './BlockchainIcon'
import { Select } from './Select'

type TProps = {
  value?: TBlockchainServiceKey | undefined
  onSelect?: (blockchain: TBlockchainServiceKey) => void
  testId?: string
}

export const BlockchainSelect = ({ value, onSelect, testId }: TProps) => {
  const { t } = useTranslation('components', { keyPrefix: 'blockchainSelect' })
  const { t: commonT } = useTranslation('common', { keyPrefix: 'blockchain' })

  const options = Object.keys(BlockchainServiceHelper.bsAggregator.blockchainServicesByName) as TBlockchainServiceKey[]

  return (
    <Select.Root value={value} onValueChange={onSelect}>
      <Select.Trigger
        id="blockchainSelect"
        className={StyleHelper.mergeStyles('bg-asphalt', {
          'text-gray-300': !value,
        })}
        {...TestHelper.buildTestObject(testId)}
      >
        <Select.Value placeholder={t('placeholder')}>
          {value && (
            <div className="flex items-center gap-x-2 text-sm text-gray-100">
              <BlockchainIcon blockchain={value} type="white" />
              {commonT(value)}
            </div>
          )}
        </Select.Value>

        <Select.Icon className="text-neon" />
      </Select.Trigger>

      <Select.Content>
        {options.map((blockchain, index) => (
          <Fragment key={blockchain}>
            <Select.Item
              {...TestHelper.buildTestObject(testId, 'item')}
              value={blockchain}
              className="flex cursor-pointer items-center justify-start gap-x-2 text-sm text-gray-100 hover:bg-gray-300/15"
            >
              <BlockchainIcon blockchain={blockchain} type="white" />
              <Select.ItemText>{commonT(blockchain)}</Select.ItemText>
            </Select.Item>

            {index + 1 !== options.length && <Select.Separator />}
          </Fragment>
        ))}
      </Select.Content>
    </Select.Root>
  )
}
