import { useTranslation } from 'react-i18next'

import { Accordion } from '@renderer/components/Accordion'

import { SettingsLayout } from '@renderer/layouts/Settings'

import { getBlockchainNames } from '@renderer/libs/blockchain-service'
import { TBlockchainServiceKey } from '@shared/types/blockchain'

import { BlockchainNetworkAccordion } from './BlockchainNetworkAccordion'
import { NetworkProfileActions } from './NetworkProfileActions'
import { NetworkProfileSelect } from './NetworkProfileSelect'

const SettingsNetwork = () => {
  const { t } = useTranslation('pages', { keyPrefix: 'settings.settingsNetwork' })

  return (
    <SettingsLayout
      title={t('title')}
      actions={
        <div className="flex items-center gap-2.5">
          <NetworkProfileSelect />
          <NetworkProfileActions />
        </div>
      }
    >
      <p className="mb-7 text-xs">{t('youAreConnectedNeoAndEth')}</p>

      <Accordion.Root type="multiple" defaultValue={['neo3']}>
        {getBlockchainNames().map(blockchain => (
          <BlockchainNetworkAccordion key={`network-${blockchain}`} blockchain={blockchain as TBlockchainServiceKey} />
        ))}
      </Accordion.Root>
    </SettingsLayout>
  )
}

export default SettingsNetwork
