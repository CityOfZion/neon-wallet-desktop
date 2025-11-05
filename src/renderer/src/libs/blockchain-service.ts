import { BSAggregator } from '@cityofzion/bs-multichain'

import { bindApiFromMain } from '@cityofzion/bs-electron/dist/renderer'
import { TBlockchainServiceKey } from '@shared/types/blockchain'

export let bsAggregator: BSAggregator<TBlockchainServiceKey>

export function getBlockchainNames(): TBlockchainServiceKey[] {
  return Object.keys(bsAggregator.blockchainServicesByName) as TBlockchainServiceKey[]
}

export function doesBlockchainSupported(blockchain: string): blockchain is TBlockchainServiceKey {
  return Object.prototype.hasOwnProperty.call(bsAggregator.blockchainServicesByName, blockchain)
}

export const setupBSAggregator = () => {
  bsAggregator = bindApiFromMain<BSAggregator<TBlockchainServiceKey>>('BSAggregator')
}
