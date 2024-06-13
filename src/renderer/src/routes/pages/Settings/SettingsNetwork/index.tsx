import { useTranslation } from 'react-i18next'
import { TBlockchainServiceKey } from '@renderer/@types/blockchain'
import { Accordion } from '@renderer/components/Accordion'
import { SettingsLayout } from '@renderer/layouts/Settings'
import { bsAggregator } from '@renderer/libs/blockchainService'

import { BlockchainNetworkAccordion } from './BlockchainNetworkAccordion'
import { NetworkProfileActions } from './NetworkProfileActions'
import { NetworkProfileSelect } from './NetworkProfileSelect'

const blockchains = Object.keys(bsAggregator.blockchainServicesByName) as TBlockchainServiceKey[]

export const SettingsNetwork = () => {
  const { t } = useTranslation('pages', { keyPrefix: 'settings.settingsNetwork' })

  return (
    <SettingsLayout
      title={t('title')}
      actions={
        <div className="flex gap-2.5 items-center">
          <NetworkProfileSelect />
          <NetworkProfileActions />
        </div>
      }
    >
      <p className="mb-7 text-xs">{t('youAreConnectedNeoAndEth')}</p>

      <Accordion.Root type="multiple" defaultValue={['neo3']}>
        {blockchains.map(blockchain => (
          <BlockchainNetworkAccordion key={`network-${blockchain}`} blockchain={blockchain as TBlockchainServiceKey} />
        ))}
      </Accordion.Root>
    </SettingsLayout>
  )
}
