import { TBlockchainServiceKey } from '@shared/@types/blockchain'

export const SWAP_NETWORK_BY_BLOCKCHAIN_AND_NETWORK_ID: {
  [K in TBlockchainServiceKey]: Record<string, string[]>
} = {
  neo3: {
    mainnet: ['neo3'],
  },
  neoLegacy: {
    mainnet: ['neo', 'gas'],
  },
  ethereum: {
    '1': ['eth'],
  },
  neox: {
    '47763': [''],
  },
  polygon: {
    '137': ['matic'],
  },
  base: {
    '8453': ['base', 'baseevm'],
  },
  arbitrum: {
    '42161': ['arbitrum', 'arbevm', 'arbnova'],
  },
}
