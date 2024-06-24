import { Account, hasLedger } from '@cityofzion/blockchain-service'
import NodeHidTransport from '@ledgerhq/hw-transport-node-hid'
import { BrowserWindow, ipcMain } from 'electron'

import { bsAggregator } from './bsAggregator'

const NodeHidTransportFixed = (NodeHidTransport as any).default as typeof NodeHidTransport

const transportersInfoByDescriptor: Map<
  string,
  {
    address: string
    publicKey: string
    blockchain: string
    transport: NodeHidTransport
    vendorId: number
  }
> = new Map()
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
  ipcMain.handle('getConnectedLedgers', () => {
    return Array.from(transportersInfoByDescriptor.values()).map(({ address, publicKey, blockchain, vendorId }) => {
      return { address, publicKey, blockchain, vendorId }
    })
  })

  ipcMain.on('startLedger', () => {
    if (started) return
    started = true

    NodeHidTransportFixed.listen({
      complete: () => {},
      error: () => {},
      next: async event => {
        const browserWindow = BrowserWindow.getAllWindows()[0]
        if (!browserWindow) return

        const vendorId = event.device.vendorId.toString()

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
                vendorId,
              })
              browserWindow.webContents.send('ledgerConnected', address, publicKey, service.blockchainName, vendorId)
            } catch {
              /* empty */
            }
          }
        }

        if (event.type === 'remove') {
          const info = transportersInfoByDescriptor.get(String(event.descriptor))
          if (!info) return

          browserWindow.webContents.send('ledgerDisconnected', info.address)
          transportersInfoByDescriptor.delete(String(event.descriptor))
        }
      },
    })
  })

  Object.values(bsAggregator.blockchainServicesByName).forEach(service => {
    if (!hasLedger(service)) return

    service.ledgerService.emitter.on('getSignatureStart', () => {
      const browserWindow = BrowserWindow.getFocusedWindow()
      if (!browserWindow) return

      browserWindow.webContents.send('getLedgerSignatureStart')
    })

    service.ledgerService.emitter.on('getSignatureEnd', () => {
      const browserWindow = BrowserWindow.getFocusedWindow()
      if (!browserWindow) return

      browserWindow.webContents.send('getLedgerSignatureEnd')
    })
  })
}
