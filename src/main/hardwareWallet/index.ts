import { Account, hasLedger } from '@cityofzion/blockchain-service'
import { TBlockchainServiceKey } from '@shared/@types/blockchain'
import {
  TAddAccountHardwareWalletGenericParams,
  TConnectHardwareWalletGenericParams,
  THardwareWalletInfo,
  TIsConnectedAndUnlockedHardwareWalletGenericParams,
} from '@shared/@types/ipc'
import { mainApi } from '@shared/api/main'
import { app } from 'electron'

import { bsAggregator } from '../bsAggregator'

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
  }: TConnectHardwareWalletGenericParams): Promise<Account<TBlockchainServiceKey>[]> {
    let newAccounts: Account<TBlockchainServiceKey>[] = []

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

    // Get only neoLegacy transporter if it exists because NEO Ledger app also detect neo3
    const newNeoLegacyAccounts = newAccounts.filter(account => account.blockchain === 'neoLegacy')
    if (newNeoLegacyAccounts.length > 0) {
      newAccounts = newNeoLegacyAccounts
    }

    this.info = {
      accounts: newAccounts,
      transport,
    }

    return newAccounts
  }

  static async addAccount({ blockchain, index }: TAddAccountHardwareWalletGenericParams) {
    if (!this.info) {
      throw new Error('Hardware wallet is not connected')
    }

    const service = bsAggregator.blockchainServicesByName[blockchain]
    if (!hasLedger(service)) {
      throw new Error('This service does not support Ledger')
    }

    const account = await service.ledgerService.getAccount(this.info.transport, index)

    this.info.accounts.push(account)

    return account
  }

  static async isConnectedAndUnlocked({ blockchain }: TIsConnectedAndUnlockedHardwareWalletGenericParams) {
    if (!this.info) {
      throw new Error('Hardware wallet is not connected')
    }

    const service = bsAggregator.blockchainServicesByName[blockchain]
    if (!hasLedger(service)) {
      throw new Error('This service does not support Ledger')
    }

    const accountFromHardwareService = await service.ledgerService.getAccount(this.info.transport, 0)

    return !!accountFromHardwareService
  }
}

export function registerHardwareWalletHandler() {
  mainApi.listenAsync('hardwareWallet:disconnect', () => HardwareWalletGeneric.disconnect())
  mainApi.listenAsync('hardwareWallet:isConnectedAndUnlocked', ({ args }) =>
    HardwareWalletGeneric.isConnectedAndUnlocked(args)
  )
  mainApi.listenAsync('hardwareWallet:addAccount', ({ args }) => HardwareWalletGeneric.addAccount(args))

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
