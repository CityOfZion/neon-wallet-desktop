import { FormEvent, Fragment, type JSX, useState } from 'react'

import { useTranslation } from 'react-i18next'

import { BlockchainIcon } from '@renderer/components/BlockchainIcon'
import { Button } from '@renderer/components/Button'
import { RadioGroup } from '@renderer/components/RadioGroup'
import { Separator } from '@renderer/components/Separator'

import { useModalState } from '@renderer/hooks/useModalRouter'

import { SideModalLayout } from '@renderer/layouts/SideModal'

import { bsAggregator } from '@renderer/libs/blockchain-service'
import { TBlockchainServiceKey } from '@shared/types/blockchain'

type TLocation = {
  heading: string
  headingIcon?: JSX.Element
  description?: string
  subtitle?: string
  buttonLabel?: string
  onSelect?: (blockchain: TBlockchainServiceKey) => void
}

const BlockchainSelectionModal = () => {
  const { t } = useTranslation('modals', { keyPrefix: 'blockchainSelectionModal' })
  const { t: blockchainT } = useTranslation('common', { keyPrefix: 'blockchain' })
  const { heading, headingIcon, description, buttonLabel, onSelect, subtitle } = useModalState<TLocation>()

  const [selectedBlockchain, setSelectedBlockchain] = useState<TBlockchainServiceKey>('neo3')

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!selectedBlockchain) return
    onSelect?.(selectedBlockchain)
  }

  const handleSelectRadioItem = (service: TBlockchainServiceKey) => {
    setSelectedBlockchain(service)
  }

  return (
    <SideModalLayout heading={heading} headingIcon={headingIcon} contentClassName="flex flex-col">
      {subtitle && (
        <Fragment>
          <p className="text-xs text-gray-100">{subtitle}</p>

          <Separator className="my-7" />
        </Fragment>
      )}

      <p>{description}</p>

      <form className="mt-6 flex grow flex-col" onSubmit={handleSubmit}>
        <div className="flex h-0 min-h-0 grow flex-col gap-2.5">
          <RadioGroup.Group
            value={selectedBlockchain}
            onValueChange={handleSelectRadioItem}
            className="overflow-y-auto"
          >
            {(Object.keys(bsAggregator.blockchainServicesByName) as TBlockchainServiceKey[]).map((service, index) => (
              <RadioGroup.Item
                key={index}
                value={service}
                className="bg-asphalt mb-2.5 h-12 rounded-sm border-none"
                withSeparator={false}
              >
                <div className="flex items-center gap-4">
                  <BlockchainIcon blockchain={service} type="gray" />
                  <label>{blockchainT(service)}</label>
                </div>
                <RadioGroup.Indicator />
              </RadioGroup.Item>
            ))}
          </RadioGroup.Group>
        </div>

        <Button
          className="mt-8"
          type="submit"
          label={buttonLabel ?? t('buttonContinueLabel')}
          flat
          disabled={!selectedBlockchain}
        />
      </form>
    </SideModalLayout>
  )
}

export default BlockchainSelectionModal
