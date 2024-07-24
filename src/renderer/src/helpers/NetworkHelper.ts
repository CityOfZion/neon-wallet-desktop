import { NETWORK_OPTIONS_BY_BLOCKCHAIN } from '@renderer/constants/networks'
import { TBlockchainServiceKey, TNetwork } from '@shared/@types/blockchain'

export class NetworkHelper {
  static isTestnet<T extends TBlockchainServiceKey>(blockchain: T, network: TNetwork<T>): boolean {
    const testnetNetworks = NETWORK_OPTIONS_BY_BLOCKCHAIN[blockchain].testnet
    return testnetNetworks.some(item => item.id === network.id)
  }

  static isCustom<T extends TBlockchainServiceKey>(blockchain: T, network: TNetwork<T>): boolean {
    const networks = NETWORK_OPTIONS_BY_BLOCKCHAIN[blockchain].all
    return networks.every(item => item.id !== network.id)
  }

  static isMainnet<T extends TBlockchainServiceKey>(blockchain: T, network: TNetwork<T>): boolean {
    const mainnetNetworks = NETWORK_OPTIONS_BY_BLOCKCHAIN[blockchain].mainnet
    return mainnetNetworks.some(item => item.id === network.id)
  }

  static getColorByNetwork<T extends TBlockchainServiceKey>(
    network: TNetwork<TBlockchainServiceKey>,
    blockchain: T
  ): string {
    if (NetworkHelper.isMainnet(blockchain, network)) {
      return 'bg-neon'
    }

    if (NetworkHelper.isTestnet(blockchain, network)) {
      return 'bg-magenta'
    }

    return 'bg-pink'
  }
}
