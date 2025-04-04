import { Account, hasLedger } from '@cityofzion/blockchain-service'
import { ledgerUSBVendorId } from '@ledgerhq/devices'
import Transport from '@ledgerhq/hw-transport'
import NodeHidTransport, { getDevices } from '@ledgerhq/hw-transport-node-hid-noevents'
import { TBlockchainServiceKey } from '@shared/@types/blockchain'
import {
  TAddHardwareWalletAccountParams,
  TConnectHardwareWalletParams,
  THardwareWalletInfoWithTransport,
  TIsConnectedAndUnlockedHardwareWalletParams,
} from '@shared/@types/ipc'
import { mainApi } from '@shared/api/main'
import { usb } from 'usb'

import { bsAggregator } from './bsAggregator'

const NodeHidTransportFixed = (NodeHidTransport as any).default as typeof NodeHidTransport

let transporters: THardwareWalletInfoWithTransport[] = []

export const getHardwareWalletTransport = async ({ address, blockchain }: Account<TBlockchainServiceKey>) => {
  const transporter = transporters.find(item =>
    item.accounts.some(account => account.blockchain === blockchain && account.address === address)
  )

  if (!transporter) {
    throw new Error(`No hardware wallet found for account ${address}`)
  }

  return transporter.transport as Transport
}

const connectHardwareWallet = async ({ lastIndexesByWallet }: TConnectHardwareWalletParams) => {
  const devices = getDevices()

  if (!devices.length) throw new Error('No hardware wallet found')

  const [device] = devices

  const transport = await NodeHidTransportFixed.open(device.path)
  const newTransporters: THardwareWalletInfoWithTransport[] = []

  for (const service of Object.values(bsAggregator.blockchainServicesByName)) {
    try {
      if (!hasLedger(service)) continue

      const accounts = await service.ledgerService.getAccounts(transport, lastIndexesByWallet)

      newTransporters.push({
        accounts,
        blockchain: service.name,
        transport,
        descriptor: device.path,
      })
    } catch {
      /* empty */
    }
  }

  if (newTransporters.length > 0) {
    disconnectHardwareWallet()

    const neoLegacyTransport = newTransporters.find(({ blockchain }) => blockchain === 'neoLegacy')

    transporters = neoLegacyTransport ? [neoLegacyTransport] : newTransporters
  } else {
    transport.close()
    throw new Error('Transport is open but it was not possible to identify the blockchain')
  }

  return transporters.map(transporter => ({ blockchain: transporter.blockchain, accounts: transporter.accounts }))
}

const disconnectHardwareWallet = () => {
  transporters.forEach(transporter => transporter.transport.close())
  transporters = []
}

const getHardwareWalletAccount = async ({ blockchain, index }: TAddHardwareWalletAccountParams) => {
  const transporter = transporters.find(transporter => transporter.blockchain === blockchain)
  if (!transporter) throw new Error('Hardware wallet is not connected')

  const service = bsAggregator.blockchainServicesByName[transporter.blockchain]
  if (!hasLedger(service)) throw new Error('Blockchain does not support hardware wallet')

  const account = await service.ledgerService.getAccount(transporter.transport, index)

  return { account, transporter }
}

const addNewHardwareAccount = async ({ blockchain, index }: TAddHardwareWalletAccountParams) => {
  const { account, transporter } = await getHardwareWalletAccount({ blockchain, index })

  transporter.accounts.push(account)

  return account
}

const isConnectedAndUnlockedHardwareWallet = async ({
  account,
  order,
}: TIsConnectedAndUnlockedHardwareWalletParams) => {
  if (!account.isHardware) throw new Error("Account isn't a hardware wallet")

  const transporter = transporters.find(({ blockchain }) => blockchain === account.blockchain)

  if (!transporter) throw new Error("Transporter wasn't found")

  const service = bsAggregator.blockchainServicesByName[transporter.blockchain]

  if (!hasLedger(service)) throw new Error("This blockchain doesn't support hardware wallet")

  const accountFromHardwareService = await service.ledgerService.getAccount(transporter.transport, order)

  return !!accountFromHardwareService
}

export function registerHardwareWalletHandler() {
  mainApi.listenAsync('connectHardwareWallet', ({ args }) => connectHardwareWallet(args))
  mainApi.listenAsync('disconnectHardwareWallet', disconnectHardwareWallet)
  mainApi.listenAsync('isConnectedAndUnlockedHardwareWallet', ({ args }) => isConnectedAndUnlockedHardwareWallet(args))
  mainApi.listenAsync('addNewHardwareAccount', ({ args }) => addNewHardwareAccount(args))
  mainApi.listenAsync('getHardwareAccount', async ({ args }) => {
    const { account } = await getHardwareWalletAccount(args)
    return account
  })

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
