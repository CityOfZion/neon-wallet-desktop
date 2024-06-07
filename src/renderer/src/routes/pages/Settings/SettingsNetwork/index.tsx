import { useTranslation } from 'react-i18next'
import { MdRestartAlt } from 'react-icons/md'
import { TBlockchainServiceKey } from '@renderer/@types/blockchain'
import { Accordion } from '@renderer/components/Accordion'
import { Button } from '@renderer/components/Button'
import { DEFAULT_NETWORK_BY__BLOCKCHAIN } from '@renderer/constants/networks'
import { useNetworkActions } from '@renderer/hooks/useSettingsSelector'
import { SettingsLayout } from '@renderer/layouts/Settings'
import { bsAggregator } from '@renderer/libs/blockchainService'

import { BlockchainNetworkAccordion } from './BlockchainNetworkAccordion'

const blockchains = Object.keys(bsAggregator.blockchainServicesByName) as TBlockchainServiceKey[]

export const SettingsNetwork = () => {
  const { t } = useTranslation('pages', { keyPrefix: 'settings.settingsNetwork' })
  const { t: commonGeneral } = useTranslation('common', { keyPrefix: 'general' })
  const { setNetwork } = useNetworkActions()

  const handleResetConfig = () => {
    for (const blockchain of blockchains) {
      setNetwork(blockchain, DEFAULT_NETWORK_BY__BLOCKCHAIN[blockchain])
    }
  }

  return (
    <SettingsLayout
      title={t('title')}
      actions={
        <Button
          leftIcon={<MdRestartAlt className="text-neon" />}
          label={commonGeneral('reset')}
          clickableProps={{ className: 'w-fit' }}
          variant="text"
          colorSchema="gray"
          flat
          onClick={handleResetConfig}
        />
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
