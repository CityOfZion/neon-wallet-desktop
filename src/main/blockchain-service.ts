import { TBSAccount } from '@cityofzion/blockchain-service'
import type { BSAggregator } from '@cityofzion/bs-multichain'

import { exposeApiToRenderer } from '@cityofzion/bs-electron/dist/main'
import { SharedAccountHelper } from '@shared/helpers/SharedAccountHelper'
import type { TBlockchainServiceKey } from '@shared/types/blockchain'

async function getHardwareWalletTransport({ address, blockchain }: TBSAccount<TBlockchainServiceKey>) {
  // Avoid circular dependency
  const { connectedHardwareWalletInfo } = await import('./hardware-wallet')
  if (!connectedHardwareWalletInfo) throw new Error('No hardware wallet connected')

  const isHardwareWalletFromProvidedAddress = connectedHardwareWalletInfo.accounts.some(
    SharedAccountHelper.predicate({ address, blockchain })
  )
  if (!isHardwareWalletFromProvidedAddress)
    throw new Error('The provided address is not from the connected hardware wallet')

  return connectedHardwareWalletInfo.transport
}

export let bsAggregator: BSAggregator<TBlockchainServiceKey>

export async function setupBsAggregator() {
  const [{ BSAggregator }, { BSNeo3 }, { BSNeoLegacy }, { BSNeoX }, { BSEthereum }] = await Promise.all([
    import('@cityofzion/bs-multichain'),
    import('@cityofzion/bs-neo3'),
    import('@cityofzion/bs-neo-legacy'),
    import('@cityofzion/bs-neox'),
    import('@cityofzion/bs-ethereum'),
  ])

  const services = await Promise.all([
    Promise.resolve(new BSNeo3('neo3', undefined, getHardwareWalletTransport)),
    Promise.resolve(new BSNeoLegacy('neoLegacy', undefined, getHardwareWalletTransport)),
    Promise.resolve(new BSNeoX('neox', undefined, getHardwareWalletTransport)),
    Promise.resolve(new BSEthereum('ethereum', 'ethereum', undefined, getHardwareWalletTransport)),
    Promise.resolve(new BSEthereum('polygon', 'polygon', undefined, getHardwareWalletTransport)),
    Promise.resolve(new BSEthereum('base', 'base', undefined, getHardwareWalletTransport)),
    Promise.resolve(new BSEthereum('arbitrum', 'arbitrum', undefined, getHardwareWalletTransport)),
  ])

  bsAggregator = new BSAggregator<TBlockchainServiceKey>(services)

  exposeApiToRenderer(bsAggregator)
}
