import { useTranslation } from 'react-i18next'
import { TBlockchainServiceKey, TNetwork } from '@renderer/@types/blockchain'
import { Accordion } from '@renderer/components/Accordion'
import { BlockchainIcon } from '@renderer/components/BlockchainIcon'
import { useModalNavigate } from '@renderer/hooks/useModalRouter'
import { useNetworkActions, useSelectedNetworkSelector } from '@renderer/hooks/useSettingsSelector'

import { BlockchainNetworkButton } from './BlockchainNetworkButton'

type TProps = {
  blockchain: TBlockchainServiceKey
}

export const BlockchainNetworkAccordion = ({ blockchain }: TProps) => {
  const { t: tCommon } = useTranslation('common', { keyPrefix: 'blockchain' })
  const { t } = useTranslation('pages', { keyPrefix: 'settings.settingsNetwork' })
  const { modalNavigateWrapper } = useModalNavigate()
  const { setNetwork, setNetworkNode } = useNetworkActions()
  const { network } = useSelectedNetworkSelector(blockchain)
  return (
    <Accordion.Item value={blockchain}>
      <Accordion.Trigger>
        <div className="flex items-center gap-2.5">
          <div className="flex items-center justify-center w-4 h-4">
            <BlockchainIcon blockchain={blockchain} type="blue" className="" />
          </div>
          <span className="text-white text-sm">{tCommon(blockchain)}</span>
        </div>
      </Accordion.Trigger>

      <Accordion.Content>
        <BlockchainNetworkButton
          label={t('currentNetwork')}
          subLabel={network.name}
          onClick={modalNavigateWrapper('network-selection', {
            state: {
              blockchain,
              onNetworkChange: (selectedNetwork: TNetwork) => setNetwork(blockchain, selectedNetwork),
              network,
            },
          })}
        />
        <BlockchainNetworkButton
          className="border-none"
          label={t('nodeSelection')}
          subLabel={network.url}
          onClick={modalNavigateWrapper('network-node-selection', {
            state: {
              blockchain,
              onNetworkNodeChange: (url: string) => setNetworkNode(blockchain, url),
              network,
            },
          })}
        />
      </Accordion.Content>
    </Accordion.Item>
  )
}
