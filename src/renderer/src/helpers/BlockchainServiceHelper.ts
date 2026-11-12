import type { TBSServiceName } from '@cityofzion/bs-multichain'

import { bindApiFromMain } from '@cityofzion/bs-electron/dist/renderer'
import type { TBSAggregator } from '@shared/types/blockchain'

export class BlockchainServiceHelper {
  static bsAggregator: TBSAggregator
  static blockchainNames: TBSServiceName[]

  static doesBlockchainSupported(blockchain: string): blockchain is TBSServiceName {
    return Object.prototype.hasOwnProperty.call(this.bsAggregator.blockchainServicesByName, blockchain)
  }

  static setup = () => {
    this.bsAggregator = bindApiFromMain('BSAggregator')
    this.blockchainNames = Object.keys(this.bsAggregator.blockchainServicesByName) as TBSServiceName[]
  }
}
