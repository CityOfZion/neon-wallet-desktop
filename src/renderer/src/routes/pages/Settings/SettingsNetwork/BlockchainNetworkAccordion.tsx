import { useTranslation } from 'react-i18next'

import { Accordion } from '@renderer/components/Accordion'
import { BlockchainIcon } from '@renderer/components/BlockchainIcon'

import { useModalNavigate } from '@renderer/hooks/useModalRouter'
import { useSelectedNetworkProfileSelector, useSelectedNetworkSelector } from '@renderer/hooks/useSettingsSelector'

import { DEFAULT_NETWORK_PROFILE_ID } from '@renderer/constants/networks'
import { bsAggregator } from '@renderer/libs/blockchain-service'
import { TBlockchainServiceKey } from '@shared/@types/blockchain'

import { BlockchainNetworkButton } from './BlockchainNetworkButton'

type TProps = {
  blockchain: TBlockchainServiceKey
}

export const BlockchainNetworkAccordion = ({ blockchain }: TProps) => {
  const { t: tCommon } = useTranslation('common', { keyPrefix: 'blockchain' })
  const { t } = useTranslation('pages', { keyPrefix: 'settings.settingsNetwork' })
  const { modalNavigateWrapper } = useModalNavigate()
  const { network } = useSelectedNetworkSelector(blockchain)
  const { selectedNetworkProfile } = useSelectedNetworkProfileSelector()

  const isDefaultSelected = selectedNetworkProfile.id === DEFAULT_NETWORK_PROFILE_ID

  const service = bsAggregator.blockchainServicesByName[blockchain]

  return (
    <Accordion.Item value={blockchain}>
      <Accordion.Trigger>
        <div className="flex items-center gap-2.5">
          <div className="flex h-4 w-4 items-center justify-center">
            <BlockchainIcon blockchain={blockchain} type="blue" />
          </div>
          <span className="text-sm text-white">{tCommon(blockchain)}</span>
        </div>
      </Accordion.Trigger>

      <Accordion.Content>
        <BlockchainNetworkButton
          label={t('currentNetwork')}
          subLabel={network.name}
          onClick={modalNavigateWrapper('network-selection', { state: { blockchain } })}
          disabled={isDefaultSelected}
        />

        <BlockchainNetworkButton
          className="border-none"
          label={t('nodeSelection')}
          subLabel={network.url}
          onClick={modalNavigateWrapper('network-node-selection', { state: { blockchain } })}
          disabled={service.availableNetworkURLs.length <= 1}
        />
      </Accordion.Content>
    </Accordion.Item>
  )
}
