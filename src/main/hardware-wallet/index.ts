import { hasLedger, TBSAccount } from '@cityofzion/blockchain-service'
import { app } from 'electron'

import { mainApi } from '@shared/api/main'
import { TBlockchainServiceKey } from '@shared/types/blockchain'
import {
  TConnectHardwareWalletGenericParams,
  TGetAccountHardwareWalletGenericParams,
  THardwareWalletInfo,
  TIsConnectedAndUnlockedHardwareWalletGenericParams,
} from '@shared/types/ipc'

import { bsAggregator } from '../blockchain-service'

export class HardwareWalletGeneric {
  static info: THardwareWalletInfo | undefined

  static async disconnect() {
    if (!this.info) return

    await this.info.transport.close()

    mainApi.send('hardwareWallet:onDisconnect')
    this.info = undefined
  }

  static async connect({
    transport,
    blockchain,
    lastIndexesByWallet,
  }: TConnectHardwareWalletGenericParams): Promise<TBSAccount<TBlockchainServiceKey>[]> {
    const newAccounts: TBSAccount<TBlockchainServiceKey>[] = []

    if (this.info) {
      throw new Error('You must disconnect the hardware wallet before connecting again')
    }

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

    this.info = {
      accounts: newAccounts,
      transport,
    }

    return newAccounts
  }

  static async getAccounts({ blockchain, index }: TGetAccountHardwareWalletGenericParams) {
    if (!this.info) {
      throw new Error('Hardware wallet is not connected')
    }

    const service = bsAggregator.blockchainServicesByName[blockchain]
    if (!hasLedger(service)) {
      throw new Error('This service does not support Ledger')
    }

    const account = await service.ledgerService.getAccount(this.info.transport, index)

    return account
  }

  static async addAccount(params: TGetAccountHardwareWalletGenericParams) {
    const account = await this.getAccounts(params)

    this.info!.accounts.push(account)

    return account
  }

  static async isConnectedAndUnlocked({ blockchain }: TIsConnectedAndUnlockedHardwareWalletGenericParams) {
    const accountFromHardwareService = await this.getAccounts({ blockchain, index: 0 })

    return !!accountFromHardwareService
  }
}

export function setupHardwareWalletHandler() {
  mainApi.listenAsync('hardwareWallet:disconnect', () => HardwareWalletGeneric.disconnect())
  mainApi.listenAsync('hardwareWallet:isConnectedAndUnlocked', ({ args }) =>
    HardwareWalletGeneric.isConnectedAndUnlocked(args)
  )
  mainApi.listenAsync('hardwareWallet:addAccount', ({ args }) => HardwareWalletGeneric.addAccount(args))
  mainApi.listenAsync('hardwareWallet:getAccount', ({ args }) => HardwareWalletGeneric.getAccounts(args))

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
    HardwareWalletGeneric.disconnect()
  })
}
