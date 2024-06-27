import { BSAggregator } from '@cityofzion/blockchain-service'
import { exposeApiToRenderer } from '@cityofzion/bs-electron/dist/main'
import { BSEthereum } from '@cityofzion/bs-ethereum'
import { BSNeoLegacy } from '@cityofzion/bs-neo-legacy'
import { BSNeo3 } from '@cityofzion/bs-neo3'
import { TBlockchainServiceKey } from '@shared/@types/blockchain'

import { getLedgerTransport } from './ledger'

export let bsAggregator: BSAggregator<TBlockchainServiceKey>

export function exposeBsAggregatorToRenderer() {
  bsAggregator = new BSAggregator<TBlockchainServiceKey>({
    neo3: new BSNeo3('neo3', { type: 'mainnet' }, getLedgerTransport),
    neoLegacy: new BSNeoLegacy('neoLegacy', { type: 'mainnet' }),
    ethereum: new BSEthereum('ethereum', { type: 'mainnet' }, getLedgerTransport),
  })

  exposeApiToRenderer(bsAggregator)
}
