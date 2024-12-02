import { BSAggregator } from '@cityofzion/blockchain-service'
import { exposeApiToRenderer } from '@cityofzion/bs-electron/dist/main'
import { BSEthereum } from '@cityofzion/bs-ethereum'
import { BSNeoLegacy } from '@cityofzion/bs-neo-legacy'
import { BSNeo3 } from '@cityofzion/bs-neo3'
import { TBlockchainServiceKey } from '@shared/@types/blockchain'

import { getHardwareWalletTransport } from './hardwareWallet'

export let bsAggregator: BSAggregator<TBlockchainServiceKey>

export function exposeBsAggregatorToRenderer() {
  bsAggregator = new BSAggregator<TBlockchainServiceKey>([
    new BSNeo3('neo3', undefined, getHardwareWalletTransport),
    new BSNeoLegacy('neoLegacy'),
    new BSEthereum('ethereum', undefined, getHardwareWalletTransport),
    new BSEthereum('neox', undefined, getHardwareWalletTransport),
    new BSEthereum('base', undefined, getHardwareWalletTransport),
  ])

  exposeApiToRenderer(bsAggregator)
}
