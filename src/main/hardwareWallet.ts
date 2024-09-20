import { Account, hasLedger } from '@cityofzion/blockchain-service'
import { ledgerUSBVendorId } from '@ledgerhq/devices'
import NodeHidTransport, { getDevices } from '@ledgerhq/hw-transport-node-hid-noevents'
import { THardwareWalletInfoWithTransport } from '@shared/@types/ipc'
import { mainApi } from '@shared/api/main'
import { usb } from 'usb'

import { bsAggregator } from './bsAggregator'

const NodeHidTransportFixed = (NodeHidTransport as any).default as typeof NodeHidTransport

let transporter: THardwareWalletInfoWithTransport | undefined

export const getHardwareWalletTransport = async (account: Account) => {
  if (!transporter || transporter.address !== account.address)
    throw new Error(`No hardware wallet found for account ${account.address}`)

  return transporter.transport
}

const disconnectHardwareWallet = () => {
  if (!transporter) return

  const connectedDevices = getDevices()
  if (connectedDevices.some(d => d.path === transporter!.descriptor)) return
  transporter.transport.close()

  mainApi.send('hardwareWalletDisconnected', {
    address: transporter.address,
    blockchain: transporter.blockchain,
    publicKey: transporter.publicKey,
  })

  transporter = undefined
}

const connectHardwareWallet = async () => {
  if (transporter) {
    return {
      address: transporter.address,
      publicKey: transporter.publicKey,
      blockchain: transporter.blockchain,
    }
  }

  const devices = getDevices()
  if (!devices.length) throw new Error('No hardware wallet found')

  const [device] = devices

  const transport = await NodeHidTransportFixed.open(device.path)

  for (const service of Object.values(bsAggregator.blockchainServicesByName)) {
    try {
      if (!hasLedger(service)) continue
      const address = await service.ledgerService.getAddress(transport)
      const publicKey = await service.ledgerService.getPublicKey(transport)
      transporter = {
        address,
        publicKey,
        blockchain: service.blockchainName,
        transport,
        descriptor: device.path,
      }
      break
    } catch {
      /* empty */
    }
  }

  if (!transporter) {
    transport.close()
    throw new Error('Transport is open but it was not possible to identify the blockchain')
  }

  return {
    address: transporter.address,
    publicKey: transporter.publicKey,
    blockchain: transporter.blockchain,
  }
}

export function registerHardwareWalletHandler() {
  mainApi.listenAsync('connectHardwareWallet', connectHardwareWallet)
  mainApi.listenAsync('disconnectHardwareWallet', disconnectHardwareWallet)

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
    disconnectHardwareWallet()
  })

  process.on('exit', () => {
    usb.unrefHotplugEvents()
  })
}
