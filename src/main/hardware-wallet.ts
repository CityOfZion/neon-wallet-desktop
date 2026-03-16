import { BSKeychainHelper, hasLedger, TBSAccount } from '@cityofzion/blockchain-service'
import { ledgerUSBVendorId } from '@ledgerhq/devices'
import type Transport from '@ledgerhq/hw-transport'
import NodeHidTransport, { getDevices } from '@ledgerhq/hw-transport-node-hid-noevents'
import { app } from 'electron'
import cloneDeep from 'lodash/cloneDeep'
import { usb } from 'usb'

import { mainApi } from '@shared/api/main'
import { AppError } from '@shared/helpers/SharedErrorHelper'
import { SharedI18nextHelper } from '@shared/helpers/SharedI18nextHelper'
import type {
  TConnectHardwareWalletParams,
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

  static async #connect(
    transport: Transport,
    lastIndexesByWallet: Partial<Record<TBlockchainServiceKey, Record<string, number>>>
  ) {
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

    return cloneDeep(accounts)
  }

  static async #onConnectByUsb({ args: { lastIndexesByWallet } }: TIpcMainBaseOptions<TConnectHardwareWalletParams>) {
    if (this.#transport) {
      throw new AppError(t('hardwareWallet.errors.disconnectFirst'))
    }

    const devices = getDevices()
    if (!devices.length) throw new AppError(t('hardwareWallet.errors.hardwareWalletNotFound'))

    const device = devices[0]

    const transport = await NodeHidTransportFixed.open(device.path).catch(() => {
      throw new AppError(t('hardwareWallet.errors.hardwareWalletNotFound'))
    })

    const accounts = await this.#connect(transport, lastIndexesByWallet)

    usb.on('detach', async device => {
      if (device.deviceDescriptor.idVendor !== ledgerUSBVendorId) return
      await this.#onDisconnect()
      usb.removeAllListeners('detach')
    })

    return accounts
  }

  static async #onDisconnect() {
    if (this.#transport) {
      await this.#transport.close()
    }

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

    if (!account.bipPath) throw new AppError(t('hardwareWallet.errors.missingBipPath'))

    const service = MainBlockchainServiceHelper.bsAggregator.blockchainServicesByName[account.blockchain]
    if (!hasLedger(service))
      throw new AppError(t('hardwareWallet.errors.blockchainNotSupported', { blockchain: account.blockchain }))

    const index = BSKeychainHelper.extractIndexFromPath(account.bipPath)

    const hardwareAccount = await service.ledgerService.getAccount(this.#transport, index)
    if (hardwareAccount.address !== account.address) {
      throw new AppError(t('hardwareWallet.errors.accountIsNotHardware'))
    }

    return this.#transport
  }

  static setupHandlers() {
    mainApi.listenAsync('hardwareWallet:connectByUsb', this.#onConnectByUsb.bind(this))
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
