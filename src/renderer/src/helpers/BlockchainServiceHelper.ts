import type { BSAggregator } from '@cityofzion/bs-multichain'

import { bindApiFromMain } from '@cityofzion/bs-electron/dist/renderer'
import type { TBlockchainServiceKey } from '@shared/types/blockchain'

export class BlockchainServiceHelper {
  static bsAggregator: BSAggregator<TBlockchainServiceKey>
  static blockchainNames: TBlockchainServiceKey[]

  static doesBlockchainSupported(blockchain: string): blockchain is TBlockchainServiceKey {
    return Object.prototype.hasOwnProperty.call(this.bsAggregator.blockchainServicesByName, blockchain)
  }

  static setup = () => {
    this.bsAggregator = bindApiFromMain<BSAggregator<TBlockchainServiceKey>>('BSAggregator')
    this.blockchainNames = Object.keys(this.bsAggregator.blockchainServicesByName) as TBlockchainServiceKey[]
  }
}
