import { useTranslation } from 'react-i18next'

import { Accordion } from '@renderer/components/Accordion'
import { BlockchainIcon } from '@renderer/components/BlockchainIcon'

import { BlockchainServiceHelper } from '@renderer/helpers/BlockchainServiceHelper'
import { ConstantsHelper } from '@renderer/helpers/ConstantsHelper'

import { useModalNavigate } from '@renderer/hooks/useModalRouter'
import { useSelectedNetworkProfileSelector, useSelectedNetworkSelector } from '@renderer/hooks/useSettingsSelector'

import { TBlockchainServiceKey } from '@shared/types/blockchain'

import { BlockchainNetworkButton } from './BlockchainNetworkButton'

type TProps = {
  blockchain: TBlockchainServiceKey
}

export const BlockchainNetworkAccordion = ({ blockchain }: TProps) => {
  const { t: tCommonBlockchain } = useTranslation('common', { keyPrefix: 'blockchain' })
  const { t } = useTranslation('pages', { keyPrefix: 'settings.settingsNetwork' })
  const { modalNavigateWrapper } = useModalNavigate()
  const { network } = useSelectedNetworkSelector(blockchain)
  const { selectedNetworkProfile } = useSelectedNetworkProfileSelector()

  const service = BlockchainServiceHelper.bsAggregator.blockchainServicesByName[blockchain]

  const isCurrentNetworkDisabled =
    selectedNetworkProfile.id === ConstantsHelper.defaultNetworkProfileId ||
    (service.availableNetworks.length <= 1 && !service.isCustomNetworkSupported)

  return (
    <Accordion.Item value={blockchain}>
      <Accordion.Trigger>
        <div className="flex items-center gap-2.5">
          <div className="flex size-4 items-center justify-center">
            <BlockchainIcon className="text-blue" blockchain={blockchain} />
          </div>
          <span className="text-sm text-white">{tCommonBlockchain(blockchain)}</span>
        </div>
      </Accordion.Trigger>

      <Accordion.Content>
        <BlockchainNetworkButton
          label={t('currentNetwork')}
          subLabel={network.name}
          onClick={modalNavigateWrapper('network-selection', { state: { blockchain } })}
          disabled={isCurrentNetworkDisabled}
        />

        <BlockchainNetworkButton
          className="border-none"
          label={t('networkUrlSelection')}
          subLabel={network.url}
          onClick={modalNavigateWrapper('network-url-selection', { state: { blockchain } })}
          disabled={service.networkUrls.length <= 1}
        />
      </Accordion.Content>
    </Accordion.Item>
  )
}
