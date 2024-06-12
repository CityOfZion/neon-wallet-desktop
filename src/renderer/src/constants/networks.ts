import { DEFAULT_URL_BY_NETWORK_TYPE as BSETHEREUM_DEFAULT_URL_BY_NETWORK_TYPE } from '@cityofzion/bs-ethereum'
import { DEFAULT_URL_BY_NETWORK_TYPE as BSNEOLEGACY_DEFAULT_URL_BY_NETWORK_TYPE } from '@cityofzion/bs-neo-legacy'
import { DEFAULT_URL_BY_NETWORK_TYPE as BSNEO3_DEFAULT_URL_BY_NETWORK_TYPE } from '@cityofzion/bs-neo3'
import { TBlockchainServiceKey, TNetwork, TNetworkType } from '@renderer/@types/blockchain'
import { getI18next } from '@renderer/libs/i18next'

const { t } = getI18next()

export const DEFAULT_NETWORK_URL_BY_BLOCKCHAIN: Record<TBlockchainServiceKey, Record<TNetworkType, string>> = {
  neo3: BSNEO3_DEFAULT_URL_BY_NETWORK_TYPE,
  neoLegacy: {
    ...BSNEOLEGACY_DEFAULT_URL_BY_NETWORK_TYPE,
    custom: '',
  },
  ethereum: BSETHEREUM_DEFAULT_URL_BY_NETWORK_TYPE,
}

export const NETWORK_OPTIONS_BY_BLOCKCHAIN: Record<TBlockchainServiceKey, TNetwork[]> = {
  neo3: [
    {
      id: 'neo3-mainnet',
      type: 'mainnet',
      name: t('common:networkTypeLabel.mainnet'),
      url: DEFAULT_NETWORK_URL_BY_BLOCKCHAIN.neo3.mainnet,
    },
    {
      id: 'neo3-testnet',
      type: 'testnet',
      name: t('common:networkTypeLabel.testnet'),
      url: DEFAULT_NETWORK_URL_BY_BLOCKCHAIN.neo3.testnet,
    },
  ],
  neoLegacy: [
    {
      id: 'neo-legacy-mainnet',
      type: 'mainnet',
      name: t('common:networkTypeLabel.mainnet'),
      url: DEFAULT_NETWORK_URL_BY_BLOCKCHAIN.neoLegacy.mainnet,
    },
    {
      id: 'neo-legacy-testnet',
      type: 'testnet',
      name: t('common:networkTypeLabel.testnet'),
      url: DEFAULT_NETWORK_URL_BY_BLOCKCHAIN.neoLegacy.testnet,
    },
  ],
  ethereum: [
    {
      id: 'ethereum-mainnet',
      type: 'mainnet',
      name: t('common:networkTypeLabel.mainnet'),
      url: DEFAULT_NETWORK_URL_BY_BLOCKCHAIN.ethereum.mainnet,
    },
    {
      id: 'ethereum-testnet',
      type: 'testnet',
      name: t('common:networkTypeLabel.testnet'),
      url: DEFAULT_NETWORK_URL_BY_BLOCKCHAIN.ethereum.testnet,
    },
  ],
}

export const DEFAULT_NETWORK_BY__BLOCKCHAIN: Record<TBlockchainServiceKey, TNetwork> = {
  ethereum: NETWORK_OPTIONS_BY_BLOCKCHAIN.ethereum[0],
  neo3: NETWORK_OPTIONS_BY_BLOCKCHAIN.neo3[0],
  neoLegacy: NETWORK_OPTIONS_BY_BLOCKCHAIN.neoLegacy[0],
}

export const DEFAULT_NETWORK_PROFILE = {
  name: t('common:general.default'),
  id: 'default',
  networkByBlockchain: DEFAULT_NETWORK_BY__BLOCKCHAIN,
}

export const COLOR_BY_NETWORK_TYPE: Record<TNetworkType, string> = {
  mainnet: 'bg-neon',
  testnet: 'bg-magenta',
  custom: 'bg-pink',
}

export const BLOCKCHAIN_WITH_CUSTOM_NETWORK: TBlockchainServiceKey[] = ['neo3', 'ethereum']
