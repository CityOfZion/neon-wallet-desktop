import { BSEthereumHelper } from '@cityofzion/bs-ethereum'
import { BSNeoLegacyHelper } from '@cityofzion/bs-neo-legacy'
import { BSNeo3Helper } from '@cityofzion/bs-neo3'
import { getI18next } from '@renderer/libs/i18next'
import { TBlockchainServiceKey, TNetwork } from '@shared/@types/blockchain'

const { t } = getI18next()

export const NETWORK_OPTIONS_BY_BLOCKCHAIN: Record<
  TBlockchainServiceKey,
  {
    mainnet: TNetwork<TBlockchainServiceKey>[]
    testnet: TNetwork<TBlockchainServiceKey>[]
    all: TNetwork<TBlockchainServiceKey>[]
  }
> = {
  neo3: {
    all: BSNeo3Helper.ALL_NETWORKS,
    mainnet: BSNeo3Helper.MAINNET_NETWORKS,
    testnet: BSNeo3Helper.TESTNET_NETWORKS,
  },
  neoLegacy: {
    all: BSNeoLegacyHelper.ALL_NETWORKS,
    mainnet: BSNeoLegacyHelper.MAINNET_NETWORKS,
    testnet: BSNeoLegacyHelper.TESTNET_NETWORKS,
  },
  ethereum: {
    all: BSEthereumHelper.ALL_NETWORKS.filter(({ id }) => !BSEthereumHelper.NEOX_NETWORK_IDS.includes(id)),
    mainnet: BSEthereumHelper.MAINNET_NETWORKS.filter(({ id }) => !BSEthereumHelper.NEOX_NETWORK_IDS.includes(id)),
    testnet: BSEthereumHelper.TESTNET_NETWORKS.filter(({ id }) => !BSEthereumHelper.NEOX_NETWORK_IDS.includes(id)),
  },
  neox: {
    all: BSEthereumHelper.NEOX_NETWORKS,
    mainnet: [],
    testnet: [BSEthereumHelper.NEOX_TESTNET_NETWORK],
  },
}

export const DEFAULT_NETWORK_BY__BLOCKCHAIN: Record<TBlockchainServiceKey, TNetwork<TBlockchainServiceKey>> = {
  neo3: NETWORK_OPTIONS_BY_BLOCKCHAIN.neo3.mainnet[0],
  neoLegacy: NETWORK_OPTIONS_BY_BLOCKCHAIN.neoLegacy.mainnet[0],
  ethereum: NETWORK_OPTIONS_BY_BLOCKCHAIN.ethereum.mainnet[0],
  neox: NETWORK_OPTIONS_BY_BLOCKCHAIN.neox.testnet[0],
}

export const DEFAULT_NETWORK_PROFILE = {
  name: t('common:general.default'),
  id: 'default',
  networkByBlockchain: DEFAULT_NETWORK_BY__BLOCKCHAIN,
}

export const BLOCKCHAIN_WITH_CUSTOM_NETWORK: TBlockchainServiceKey[] = ['neo3']

export const CUSTOM_NETWORK_ID = 'custom'
