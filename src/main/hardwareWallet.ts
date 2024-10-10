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
  if (!transporter || !transporter.accounts.some(item => item.address === account.address)) {
    throw new Error(`No hardware wallet found for account ${account.address}`)
  }

  return transporter.transport
}

const connectHardwareWallet = async () => {
  if (transporter) {
    return {
      accounts: transporter.accounts,
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
      const accounts = await service.ledgerService.getAccounts(transport)

      transporter = {
        accounts,
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
    accounts: transporter.accounts,
    blockchain: transporter.blockchain,
    descriptor: transporter.descriptor,
  }
}

const addNewHardwareAccount = async (index: number) => {
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
  mainApi.listenAsync('disconnectHardwareWallet', () => {
    if (!transporter) return

    transporter.transport.close()

    transporter = undefined
  })
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
    if (!transporter) return

    const connectedDevices = getDevices()

    if (connectedDevices.some(device => device.path === transporter!.descriptor)) return

    transporter.transport.close()

    mainApi.send('hardwareWalletDisconnected', {
      accounts: transporter.accounts,
      blockchain: transporter.blockchain,
      descriptor: transporter.descriptor,
    })

    transporter = undefined
  })

  process.on('exit', () => {
    usb.unrefHotplugEvents()
  })
}
