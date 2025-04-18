import { Account, BSAggregator } from '@cityofzion/blockchain-service'
import { exposeApiToRenderer } from '@cityofzion/bs-electron/dist/main'
import { BSEthereum } from '@cityofzion/bs-ethereum'
import { BSNeoLegacy } from '@cityofzion/bs-neo-legacy'
import { BSNeo3 } from '@cityofzion/bs-neo3'
import { TBlockchainServiceKey } from '@shared/@types/blockchain'
import { SharedAccountHelper } from '@shared/helpers/SharedAccountHelper'

export const getHardwareWalletTransport = async ({ address, blockchain }: Account<TBlockchainServiceKey>) => {
  // This import is only to avoid circular dependencies
  const { HardwareWalletGeneric } = await import('./hardwareWallet')
  if (!HardwareWalletGeneric.info) {
    throw new Error('No hardware wallet connected')
  }
  const isHardwareWalletFromProvidedAddress = HardwareWalletGeneric.info?.accounts.some(
    SharedAccountHelper.predicate({ address, blockchain })
  )
  if (!isHardwareWalletFromProvidedAddress) {
    throw new Error('The provided address is not from the connected hardware wallet')
  }
  return HardwareWalletGeneric.info.transport
}

export let bsAggregator: BSAggregator<TBlockchainServiceKey>

export function exposeBsAggregatorToRenderer() {
  bsAggregator = new BSAggregator<TBlockchainServiceKey>([
    new BSNeo3('neo3', undefined, getHardwareWalletTransport),
    new BSNeoLegacy('neoLegacy', undefined, getHardwareWalletTransport),
    new BSEthereum('ethereum', undefined, getHardwareWalletTransport),
    new BSEthereum('neox', undefined, getHardwareWalletTransport),
    new BSEthereum('polygon', undefined, getHardwareWalletTransport),
    new BSEthereum('base', undefined, getHardwareWalletTransport),
    new BSEthereum('arbitrum', undefined, getHardwareWalletTransport),
  ])

  exposeApiToRenderer(bsAggregator)
}
