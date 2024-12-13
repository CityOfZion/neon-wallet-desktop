import { BSAggregator } from '@cityofzion/blockchain-service'
import { bindApiFromMain } from '@cityofzion/bs-electron/dist/renderer'
import { TBlockchainServiceKey } from '@shared/@types/blockchain'

export const bsAggregator = bindApiFromMain<BSAggregator<TBlockchainServiceKey>>('BSAggregator')

export const blockchainNames = Object.values(bsAggregator.blockchainServicesByName).map(({ name }) => name)

export const doesBlockchainSupported = (blockchain: string): blockchain is TBlockchainServiceKey =>
  blockchainNames.includes(blockchain as TBlockchainServiceKey)
