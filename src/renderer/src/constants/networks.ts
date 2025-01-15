import { Network } from '@cityofzion/blockchain-service'
import { BSEthereumConstants, BSEthereumNetworkId } from '@cityofzion/bs-ethereum'
import { BSNeoLegacyConstants } from '@cityofzion/bs-neo-legacy'
import { BSNeo3Constants } from '@cityofzion/bs-neo3'
import { getI18next } from '@renderer/libs/i18next'
import { TBlockchainServiceKey, TNetwork } from '@shared/@types/blockchain'

const { t } = getI18next()

const POLYGON_MAINNET_NETWORK_IDS = ['137']
const POLYGON_TESTNET_NETWORK_IDS = ['1101', '80002']
const POLYGON_NETWORK_IDS = [...POLYGON_MAINNET_NETWORK_IDS, ...POLYGON_TESTNET_NETWORK_IDS]
const POLYGON_NETWORKS = BSEthereumConstants.ALL_NETWORKS.filter(({ id }) => POLYGON_NETWORK_IDS.includes(id))

const BASE_MAINNET_NETWORK_IDS = ['8453']
const BASE_TESTNET_NETWORK_IDS = ['84532']
const BASE_NETWORK_IDS = [...BASE_MAINNET_NETWORK_IDS, ...BASE_TESTNET_NETWORK_IDS]
const BASE_NETWORKS = BSEthereumConstants.ALL_NETWORKS.filter(({ id }) => BASE_NETWORK_IDS.includes(id))

const NETWORK_IDS_BASED_ON_ETHEREUM = [
  ...BSEthereumConstants.NEOX_NETWORK_IDS,
  ...POLYGON_NETWORK_IDS,
  ...BASE_NETWORK_IDS,
]

const getOnlyEthereumNetworks = (allEthereumNetworks: Network<BSEthereumNetworkId>[]) =>
  allEthereumNetworks.filter(({ id }) => !NETWORK_IDS_BASED_ON_ETHEREUM.includes(id))

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
    all: getOnlyEthereumNetworks(BSEthereumConstants.ALL_NETWORKS),
    mainnet: getOnlyEthereumNetworks(BSEthereumConstants.MAINNET_NETWORKS),
    testnet: getOnlyEthereumNetworks(BSEthereumConstants.TESTNET_NETWORKS),
  },
  neox: {
    all: BSEthereumConstants.NEOX_NETWORKS,
    mainnet: [BSEthereumConstants.NEOX_MAINNET_NETWORK],
    testnet: [BSEthereumConstants.NEOX_TESTNET_NETWORK],
  },
  polygon: {
    all: POLYGON_NETWORKS,
    mainnet: POLYGON_NETWORKS.filter(({ id }) => POLYGON_MAINNET_NETWORK_IDS.includes(id)),
    testnet: POLYGON_NETWORKS.filter(({ id }) => POLYGON_TESTNET_NETWORK_IDS.includes(id)),
  },
  base: {
    all: BASE_NETWORKS,
    mainnet: BASE_NETWORKS.filter(({ id }) => BASE_MAINNET_NETWORK_IDS.includes(id)),
    testnet: BASE_NETWORKS.filter(({ id }) => BASE_TESTNET_NETWORK_IDS.includes(id)),
  },
}

export const DEFAULT_NETWORK_BY__BLOCKCHAIN: Record<TBlockchainServiceKey, TNetwork<TBlockchainServiceKey>> = {
  neo3: NETWORK_OPTIONS_BY_BLOCKCHAIN.neo3.mainnet[0],
  neoLegacy: NETWORK_OPTIONS_BY_BLOCKCHAIN.neoLegacy.mainnet[0],
  ethereum: NETWORK_OPTIONS_BY_BLOCKCHAIN.ethereum.mainnet[0],
  neox: NETWORK_OPTIONS_BY_BLOCKCHAIN.neox.mainnet[0],
  polygon: NETWORK_OPTIONS_BY_BLOCKCHAIN.polygon.mainnet[0],
  base: NETWORK_OPTIONS_BY_BLOCKCHAIN.base.mainnet[0],
}

export const DEFAULT_NETWORK_PROFILE = {
  name: t('common:general.default'),
  id: 'default',
  networkByBlockchain: DEFAULT_NETWORK_BY__BLOCKCHAIN,
}

export const BLOCKCHAIN_WITH_CUSTOM_NETWORK: TBlockchainServiceKey[] = ['neo3']

export const CUSTOM_NETWORK_ID = 'custom'
