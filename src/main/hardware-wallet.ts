import { BSKeychainHelper, hasLedger, TBSAccount } from '@cityofzion/blockchain-service'
import type Transport from '@ledgerhq/hw-transport'
import NodeHidTransport, { getDevices } from '@ledgerhq/hw-transport-node-hid-noevents'
import { app } from 'electron'
import cloneDeep from 'lodash/cloneDeep'
import { usb } from 'usb'

import { ledgerUSBVendorId } from '@ledgerhq/devices/lib-es/index'
import { mainApi } from '@shared/api/main'
import { AppError } from '@shared/helpers/SharedErrorHelper'
import { SharedI18nextHelper } from '@shared/helpers/SharedI18nextHelper'
import type {
  TConnectHardwareWalletParams,
  TConnectHardwareWalletType,
  TGetAccountHardwareWalletGenericParams,
  TIpcMainBaseOptions,
} from '@shared/types/api'
import { TBlockchainServiceKey } from '@shared/types/blockchain'

import { MainBlockchainServiceHelper } from './blockchain-service'

const NodeHidTransportFixed = (NodeHidTransport as any).default as typeof NodeHidTransport

export let transporter: Transport | undefined

const { t } = SharedI18nextHelper.get()

export class MainHardwareWalletHelper {
  static #transport?: Transport

  static getDeviceFnByType: Record<TConnectHardwareWalletType, () => Promise<any>> = {
    usb: this.#getUsbDevice.bind(this),
  }

  static openTransportFnByType: Record<TConnectHardwareWalletType, (device: any) => Promise<Transport>> = {
    usb: NodeHidTransportFixed.open.bind(NodeHidTransportFixed),
  }

  static onHardwareDisconnectFnByType: Record<TConnectHardwareWalletType, () => void> = {
    usb: this.onHardwareDisconnectUsbDevice.bind(this),
  }

  static #getUsbDevice() {
    const devices = getDevices()
    if (!devices.length) throw new AppError(t('hardwareWallet.errors.hardwareWalletNotFound'))

    return devices[0]
  }

  static onHardwareDisconnectUsbDevice() {
    usb.on('detach', async device => {
      if (device.deviceDescriptor.idVendor !== ledgerUSBVendorId) return

      await this.#onDisconnect()
    })
  }

  static async #onConnect({ args: { lastIndexesByWallet, type } }: TIpcMainBaseOptions<TConnectHardwareWalletParams>) {
    if (this.#transport) {
      throw new AppError(t('hardwareWallet.errors.disconnectFirst'))
    }

    const device = await this.getDeviceFnByType[type]()

    const transport = await this.openTransportFnByType[type](device.path).catch(() => {
      throw new AppError(t('hardwareWallet.errors.hardwareWalletNotFound'))
    })

    const accounts: TBSAccount<TBlockchainServiceKey>[] = []

    const services = Object.values(MainBlockchainServiceHelper.bsAggregator.blockchainServicesByName)

    for (const service of services) {
      try {
        if (!hasLedger(service)) continue
        const hardwareAccounts = await service.ledgerService.getAccounts(transport, lastIndexesByWallet)
        accounts.push(...hardwareAccounts)
      } catch {
        /* empty */
      }
    }

    if (accounts.length === 0) {
      transport.close()
      throw new AppError(t('hardwareWallet.errors.accountsNotFound'))
    }

    this.#transport = transport

    this.onHardwareDisconnectFnByType[type]()

    return cloneDeep(accounts)
  }

  static async #onDisconnect() {
    if (this.#transport) {
      await this.#transport.close()
    }

    usb.removeAllListeners('detach')
    this.#transport = undefined
    mainApi.send('hardwareWallet:onDisconnect')
  }

  static async #onGetAccount({
    args: { blockchain, index },
  }: TIpcMainBaseOptions<TGetAccountHardwareWalletGenericParams>) {
    if (!this.#transport) {
      throw new AppError(t('hardwareWallet.errors.hardwareWalletNotFound'))
    }

    const service = MainBlockchainServiceHelper.bsAggregator.blockchainServicesByName[blockchain]
    if (!hasLedger(service)) {
      throw new AppError(t('hardwareWallet.errors.blockchainNotSupported', { blockchain }))
    }

    const account = await service.ledgerService.getAccount(this.#transport, index)

    return cloneDeep(account)
  }

  static #onProcessExit() {
    usb.unrefHotplugEvents()
  }

  static async getTransport(account: TBSAccount<TBlockchainServiceKey>): Promise<Transport> {
    if (!this.#transport) throw new AppError(t('hardwareWallet.errors.hardwareWalletNotFound'))

    if (!account.bip44Path) throw new AppError(t('hardwareWallet.errors.missingBip44Path'))

    const service = MainBlockchainServiceHelper.bsAggregator.blockchainServicesByName[account.blockchain]
    if (!hasLedger(service))
      throw new AppError(t('hardwareWallet.errors.blockchainNotSupported', { blockchain: account.blockchain }))

    const index = BSKeychainHelper.extractIndexFromPath(account.bip44Path)

    const hardwareAccount = await service.ledgerService.getAccount(this.#transport, index)
    if (hardwareAccount.address !== account.address) {
      throw new AppError(t('hardwareWallet.errors.accountIsNotHardware'))
    }

    return this.#transport
  }

  static setupHandlers() {
    mainApi.listenAsync('hardwareWallet:connect', this.#onConnect.bind(this))
    mainApi.listenAsync('hardwareWallet:disconnect', this.#onDisconnect.bind(this))
    mainApi.listenAsync('hardwareWallet:getAccount', this.#onGetAccount.bind(this))

    Object.values(MainBlockchainServiceHelper.bsAggregator.blockchainServicesByName).forEach(service => {
      if (!hasLedger(service)) return

      service.ledgerService.emitter.on('getSignatureStart', () => {
        mainApi.send('hardwareWallet:onSignatureStart')
      })

      service.ledgerService.emitter.on('getSignatureEnd', () => {
        mainApi.send('hardwareWallet:onSignatureEnd')
      })
    })

    app.on('window-all-closed', this.#onDisconnect.bind(this))

    process.on('exit', this.#onProcessExit.bind(this))
  }
}
