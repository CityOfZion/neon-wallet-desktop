import { hasLedger, TBSAccount } from '@cityofzion/blockchain-service'
import NodeHidTransport, { getDevices } from '@ledgerhq/hw-transport-node-hid-noevents'
import { app } from 'electron'
import { usb } from 'usb'

import { ledgerUSBVendorId } from '@ledgerhq/devices/lib-es/index'
import { mainApi } from '@shared/api/main'
import { TBlockchainServiceKey } from '@shared/types/blockchain'
import {
  type TConnectHardwareWalletByUsbParams,
  TConnectHardwareWalletGenericParams,
  TGetAccountHardwareWalletGenericParams,
  THardwareWalletInfo,
  TIsConnectedAndUnlockedHardwareWalletGenericParams,
} from '@shared/types/ipc'

import { bsAggregator } from './blockchain-service'

const NodeHidTransportFixed = (NodeHidTransport as any).default as typeof NodeHidTransport

export let connectedHardwareWalletInfo: THardwareWalletInfo | undefined

async function getAccount({ blockchain, index }: TGetAccountHardwareWalletGenericParams) {
  if (!connectedHardwareWalletInfo) {
    throw new Error('Hardware wallet is not connected')
  }

  const service = bsAggregator.blockchainServicesByName[blockchain]
  if (!hasLedger(service)) {
    throw new Error('This service does not support Ledger')
  }

  const account = await service.ledgerService.getAccount(connectedHardwareWalletInfo.transport, index)

  return account
}

async function addAccount(params: TGetAccountHardwareWalletGenericParams) {
  const account = await getAccount(params)

  connectedHardwareWalletInfo!.accounts.push(account)

  return account
}

async function isConnectedAndUnlocked({ blockchain }: TIsConnectedAndUnlockedHardwareWalletGenericParams) {
  const accountFromHardwareService = await getAccount({ blockchain, index: 0 })
  return !!accountFromHardwareService
}

async function disconnect() {
  if (!connectedHardwareWalletInfo) return

  await connectedHardwareWalletInfo.transport.close()

  mainApi.send('hardwareWallet:onDisconnect')

  connectedHardwareWalletInfo = undefined
}

async function connect({ transport, blockchain, lastIndexesByWallet }: TConnectHardwareWalletGenericParams) {
  if (connectedHardwareWalletInfo) {
    throw new Error('You must disconnect the hardware wallet before connecting again')
  }

  const newAccounts: TBSAccount<TBlockchainServiceKey>[] = []

  const services = blockchain
    ? [bsAggregator.blockchainServicesByName[blockchain]]
    : Object.values(bsAggregator.blockchainServicesByName)

  for (const service of services) {
    try {
      if (!hasLedger(service)) continue

      const accounts = await service.ledgerService.getAccounts(transport, lastIndexesByWallet)
      newAccounts.push(...accounts)
    } catch {
      /* empty */
    }
  }

  if (newAccounts.length === 0) {
    transport.close()
    throw new Error('Transport is open but it was not possible to identify the blockchain')
  }

  connectedHardwareWalletInfo = {
    accounts: newAccounts,
    transport,
  }

  return newAccounts
}

async function connectByUsb(params: TConnectHardwareWalletByUsbParams): Promise<TBSAccount<TBlockchainServiceKey>[]> {
  if (connectedHardwareWalletInfo) {
    throw new Error('You must disconnect the hardware wallet before connecting again')
  }

  const devices = getDevices()
  if (!devices.length) throw new Error('There is no hardware wallet connected')

  // It is only possible to connect to one device at a time
  const device = devices[0]

  let transport: NodeHidTransport
  try {
    transport = await NodeHidTransportFixed.open(device.path)
  } catch {
    throw new Error('There is no hardware wallet connected')
  }

  const accounts = await connect({ transport, ...params })

  usb.on('detach', async device => {
    if (device.deviceDescriptor.idVendor !== ledgerUSBVendorId) return

    await disconnect()
    usb.removeAllListeners('detach')
  })

  return accounts
}

export function setupHardwareWalletHandler() {
  mainApi.listenAsync('hardwareWallet:disconnect', () => disconnect())
  mainApi.listenAsync('hardwareWallet:isConnectedAndUnlocked', ({ args }) => isConnectedAndUnlocked(args))
  mainApi.listenAsync('hardwareWallet:addAccount', ({ args }) => addAccount(args))
  mainApi.listenAsync('hardwareWallet:getAccount', ({ args }) => getAccount(args))
  mainApi.listenAsync('hardwareWallet:connectByUsb', ({ args }) => connectByUsb(args))

  Object.values(bsAggregator.blockchainServicesByName).forEach(service => {
    if (!hasLedger(service)) return
    service.ledgerService.emitter.on('getSignatureStart', () => {
      mainApi.send('hardwareWallet:onSignatureStart')
    })
    service.ledgerService.emitter.on('getSignatureEnd', () => {
      mainApi.send('hardwareWallet:onSignatureEnd')
    })
  })

  // Disconnect hardware wallet when all windows are closed because on MacOS the app do not quit
  app.on('window-all-closed', () => {
    disconnect()
  })

  // Disconnect hardware wallet on app exit
  process.on('exit', () => {
    usb.unrefHotplugEvents()
  })
}
