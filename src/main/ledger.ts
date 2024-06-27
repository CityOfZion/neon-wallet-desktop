import { Account, hasLedger } from '@cityofzion/blockchain-service'
import NodeHidTransport from '@ledgerhq/hw-transport-node-hid'
import { TLedgerInfoWithTransport } from '@shared/@types/ipc'
import { mainApi } from '@shared/api/main'

import { bsAggregator } from './bsAggregator'

const NodeHidTransportFixed = (NodeHidTransport as any).default as typeof NodeHidTransport

const transportersInfoByDescriptor: Map<string, TLedgerInfoWithTransport> = new Map()
let started = false

export const getLedgerTransport = async (account: Account) => {
  for (const { address, transport } of transportersInfoByDescriptor.values()) {
    if (account.address === address) {
      return transport
    }
  }

  throw new Error(`No ledger found for account ${account.address}`)
}

export function registerLedgerHandler() {
  mainApi.listenAsync('getConnectedLedgers', () => {
    return Array.from(transportersInfoByDescriptor.values()).map(({ address, publicKey, blockchain }) => {
      return { address, publicKey, blockchain }
    })
  })

  mainApi.listenSync('startLedger', () => {
    if (started) return
    started = true

    NodeHidTransportFixed.listen({
      complete: () => {},
      error: () => {},
      next: async event => {
        if (event.type === 'add') {
          const transport = await NodeHidTransportFixed.open(event.descriptor)

          for (const service of Object.values(bsAggregator.blockchainServicesByName)) {
            try {
              if (!hasLedger(service)) continue
              const address = await service.ledgerService.getAddress(transport)
              const publicKey = await service.ledgerService.getPublicKey(transport)
              transportersInfoByDescriptor.set(String(event.descriptor), {
                address,
                publicKey,
                blockchain: service.blockchainName,
                transport,
              })

              mainApi.send('ledgerConnected', { address, publicKey, blockchain: service.blockchainName })
            } catch {
              /* empty */
            }
          }
        }

        if (event.type === 'remove') {
          const info = transportersInfoByDescriptor.get(String(event.descriptor))
          if (!info) return

          mainApi.send('ledgerDisconnected', info.address)
          transportersInfoByDescriptor.delete(String(event.descriptor))
        }
      },
    })
  })

  Object.values(bsAggregator.blockchainServicesByName).forEach(service => {
    if (!hasLedger(service)) return

    service.ledgerService.emitter.on('getSignatureStart', () => {
      mainApi.send('getLedgerSignatureStart')
    })

    service.ledgerService.emitter.on('getSignatureEnd', () => {
      mainApi.send('getLedgerSignatureEnd')
    })
  })
}
