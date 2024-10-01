import { BSEthereumConstants } from '@cityofzion/bs-ethereum'
import { BSNeoLegacyConstants } from '@cityofzion/bs-neo-legacy'
import { BSNeo3Constants } from '@cityofzion/bs-neo3'
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
    all: BSNeo3Constants.ALL_NETWORKS,
    mainnet: BSNeo3Constants.MAINNET_NETWORKS,
    testnet: BSNeo3Constants.TESTNET_NETWORKS,
  },
  neoLegacy: {
    all: BSNeoLegacyConstants.ALL_NETWORKS,
    mainnet: BSNeoLegacyConstants.MAINNET_NETWORKS,
    testnet: BSNeoLegacyConstants.TESTNET_NETWORKS,
  },
  ethereum: {
    all: BSEthereumConstants.ALL_NETWORKS.filter(({ id }) => !BSEthereumConstants.NEOX_NETWORK_IDS.includes(id)),
    mainnet: BSEthereumConstants.MAINNET_NETWORKS.filter(
      ({ id }) => !BSEthereumConstants.NEOX_NETWORK_IDS.includes(id)
    ),
    testnet: BSEthereumConstants.TESTNET_NETWORKS.filter(
      ({ id }) => !BSEthereumConstants.NEOX_NETWORK_IDS.includes(id)
    ),
  },
  neox: {
    all: BSEthereumConstants.NEOX_NETWORKS,
    mainnet: [BSEthereumConstants.NEOX_MAINNET_NETWORK],
    testnet: [BSEthereumConstants.NEOX_TESTNET_NETWORK],
  },
}

export const DEFAULT_NETWORK_BY__BLOCKCHAIN: Record<TBlockchainServiceKey, TNetwork<TBlockchainServiceKey>> = {
  neo3: NETWORK_OPTIONS_BY_BLOCKCHAIN.neo3.mainnet[0],
  neoLegacy: NETWORK_OPTIONS_BY_BLOCKCHAIN.neoLegacy.mainnet[0],
  ethereum: NETWORK_OPTIONS_BY_BLOCKCHAIN.ethereum.mainnet[0],
  neox: NETWORK_OPTIONS_BY_BLOCKCHAIN.neox.mainnet[0],
}

export const DEFAULT_NETWORK_PROFILE = {
  name: t('common:general.default'),
  id: 'default',
  networkByBlockchain: DEFAULT_NETWORK_BY__BLOCKCHAIN,
}

export const BLOCKCHAIN_WITH_CUSTOM_NETWORK: TBlockchainServiceKey[] = ['neo3']

export const CUSTOM_NETWORK_ID = 'custom'
