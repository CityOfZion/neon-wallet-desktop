import { BSAggregator } from '@cityofzion/blockchain-service'
import { bindApiFromMain } from '@cityofzion/bs-electron/dist/renderer'
import { TBlockchainServiceKey } from '@renderer/@types/blockchain'

export const bsAggregator = bindApiFromMain<BSAggregator<TBlockchainServiceKey>>('BSAggregator')
