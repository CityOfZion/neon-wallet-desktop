import { Account, hasLedger } from '@cityofzion/blockchain-service'
import NodeHidTransport from '@ledgerhq/hw-transport-node-hid'
import { TLedgerInfoWithTransport } from '@shared/@types/ipc'
import { mainApi } from '@shared/api/main'

import { bsAggregator } from './bsAggregator'

const NodeHidTransportFixed = (NodeHidTransport as any).default as typeof NodeHidTransport

let transporters: TLedgerInfoWithTransport[] = []
let started = false

export const getLedgerTransport = async (account: Account) => {
  const transporter = transporters.find(transporter => transporter.address === account.address)
  if (!transporter) throw new Error(`No ledger found for account ${account.address}`)

  return transporter.transport
}

export function registerLedgerHandler() {
  mainApi.listenAsync('getConnectedLedgers', () => {
    return transporters.map(({ address, publicKey, blockchain }) => ({ address, publicKey, blockchain }))
  })

  mainApi.listenAsync('startLedger', () => {
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
              transporters.push({
                address,
                publicKey,
                blockchain: service.blockchainName,
                transport,
                descriptor: String(event.descriptor),
              })

              mainApi.send('ledgerConnected', { address, publicKey, blockchain: service.blockchainName })
            } catch {
              /* empty */
            }
          }
        }

        if (event.type === 'remove') {
          const newTransporters: TLedgerInfoWithTransport[] = []

          transporters.forEach(transporter => {
            if (String(event.descriptor) === transporter.descriptor) {
              mainApi.send('ledgerDisconnected', {
                address: transporter.address,
                blockchain: transporter.blockchain,
                publicKey: transporter.publicKey,
              })
              return
            }

            newTransporters.push(transporter)
          })

          transporters = newTransporters
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
