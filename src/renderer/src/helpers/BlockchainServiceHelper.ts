import { bindApiFromMain } from '@cityofzion/bs-electron/dist/renderer'
import type { TBlockchainServiceKey, TBSAggregator } from '@shared/types/blockchain'

export class BlockchainServiceHelper {
  static bsAggregator: TBSAggregator
  static blockchainNames: TBlockchainServiceKey[]

  static doesBlockchainSupported(blockchain: string): blockchain is TBlockchainServiceKey {
    return Object.prototype.hasOwnProperty.call(this.bsAggregator.blockchainServicesByName, blockchain)
  }

  static setup = () => {
    this.bsAggregator = bindApiFromMain('BSAggregator')
    this.blockchainNames = Object.keys(this.bsAggregator.blockchainServicesByName) as TBlockchainServiceKey[]
  }
}
