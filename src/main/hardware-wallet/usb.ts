import { TBSAccount } from '@cityofzion/blockchain-service'
import { ledgerUSBVendorId } from '@ledgerhq/devices'
import NodeHidTransport, { getDevices } from '@ledgerhq/hw-transport-node-hid-noevents'
import { usb } from 'usb'

import { mainApi } from '@shared/api/main'
import { TBlockchainServiceKey } from '@shared/types/blockchain'
import { TConnectHardwareWalletByUsbParams } from '@shared/types/ipc'

import { HardwareWalletGeneric } from '.'

const NodeHidTransportFixed = (NodeHidTransport as any).default as typeof NodeHidTransport

class HardwareWalletByUsb {
  static async connect(params: TConnectHardwareWalletByUsbParams): Promise<TBSAccount<TBlockchainServiceKey>[]> {
    if (HardwareWalletGeneric.info) {
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

    const accounts = await HardwareWalletGeneric.connect({ transport, ...params })

    usb.on('detach', async device => {
      if (device.deviceDescriptor.idVendor !== ledgerUSBVendorId) return
      await HardwareWalletGeneric.disconnect()

      usb.removeAllListeners('detach')
    })

    return accounts
  }
}

export function setupHardwareWalletUsbHandler() {
  mainApi.listenAsync('hardwareWalletByUsb:connect', ({ args }) => HardwareWalletByUsb.connect(args))

  process.on('exit', () => {
    usb.unrefHotplugEvents()
  })
}
