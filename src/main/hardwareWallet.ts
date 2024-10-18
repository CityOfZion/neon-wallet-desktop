import { Account, hasLedger } from '@cityofzion/blockchain-service'
import { ledgerUSBVendorId } from '@ledgerhq/devices'
import NodeHidTransport, { getDevices } from '@ledgerhq/hw-transport-node-hid-noevents'
import { TAddHardwareWalletAccountParams, THardwareWalletInfoWithTransport } from '@shared/@types/ipc'
import { mainApi } from '@shared/api/main'
import { usb } from 'usb'

import { bsAggregator } from './bsAggregator'

const NodeHidTransportFixed = (NodeHidTransport as any).default as typeof NodeHidTransport

let transporters: THardwareWalletInfoWithTransport[] = []

export const getHardwareWalletTransport = async (account: Account) => {
  const transporter = transporters.find(item => item.accounts.some(item => item.address === account.address))
  if (!transporter) {
    throw new Error(`No hardware wallet found for account ${account.address}`)
  }

  return transporter.transport
}

const connectHardwareWallet = async () => {
  transporters = []

  const devices = getDevices()
  if (!devices.length) throw new Error('No hardware wallet found')

  const [device] = devices

  const transport = await NodeHidTransportFixed.open(device.path)

  for (const service of Object.values(bsAggregator.blockchainServicesByName)) {
    try {
      if (!hasLedger(service)) continue

      const accounts = await service.ledgerService.getAccounts(transport)

      transporters.push({
        accounts,
        blockchain: service.blockchainName,
        transport,
        descriptor: device.path,
      })
    } catch {
      /* empty */
    }
  }

  if (!transporters.length) {
    transport.close()
    throw new Error('Transport is open but it was not possible to identify the blockchain')
  }

  return transporters.map(transporter => ({ blockchain: transporter.blockchain, accounts: transporter.accounts }))
}

const disconnectHardwareWallet = () => {
  transporters.forEach(transporter => transporter.transport.close())
  transporters = []
}

const addNewHardwareAccount = async ({ blockchain, index }: TAddHardwareWalletAccountParams) => {
  const transporter = transporters.find(transporter => transporter.blockchain === blockchain)
  if (!transporter) throw new Error('Hardware wallet is not connected')

  const service = bsAggregator.blockchainServicesByName[transporter.blockchain]
  if (!hasLedger(service)) throw new Error('Blockchain does not support hardware wallet')

  const account = await service.ledgerService.getAccount(transporter.transport, index)

  transporter.accounts.push(account)

  return {
    account,
    blockchain: transporter.blockchain,
  }
}

export function registerHardwareWalletHandler() {
  mainApi.listenAsync('connectHardwareWallet', connectHardwareWallet)
  mainApi.listenAsync('disconnectHardwareWallet', disconnectHardwareWallet)
  mainApi.listenAsync('addNewHardwareAccount', ({ args }) => addNewHardwareAccount(args))

  Object.values(bsAggregator.blockchainServicesByName).forEach(service => {
    if (!hasLedger(service)) return

    service.ledgerService.emitter.on('getSignatureStart', () => {
      mainApi.send('getHardwareWalletSignatureStart')
    })

    service.ledgerService.emitter.on('getSignatureEnd', () => {
      mainApi.send('getHardwareWalletSignatureEnd')
    })
  })

  usb.on('detach', device => {
    if (device.deviceDescriptor.idVendor !== ledgerUSBVendorId) return

    const connectedDevices = getDevices()

    transporters.forEach((transporter, index) => {
      const isConnected = connectedDevices.some(device => transporter.descriptor === device.path)
      if (isConnected) return

      transporter.transport.close()

      mainApi.send('hardwareWalletDisconnected', {
        accounts: transporter.accounts,
        blockchain: transporter.blockchain,
        descriptor: transporter.descriptor,
      })

      transporters.splice(index, 1)
    })
  })

  process.on('exit', () => {
    usb.unrefHotplugEvents()
  })
}
