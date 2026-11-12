import type { TBSServiceName } from '@cityofzion/bs-multichain'
import { useTranslation } from 'react-i18next'

import { Accordion } from '@renderer/components/Accordion'

import { BlockchainServiceHelper } from '@renderer/helpers/BlockchainServiceHelper'

import { SettingsLayout } from '@renderer/layouts/Settings'

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
      <Accordion.Root type="multiple" defaultValue={['neo3']} className="pb-8">
        {BlockchainServiceHelper.blockchainNames.map(blockchain => (
          <BlockchainNetworkAccordion key={`network-${blockchain}`} blockchain={blockchain as TBSServiceName} />
        ))}
      </Accordion.Root>
    </SettingsLayout>
  )
}

export default SettingsNetwork
