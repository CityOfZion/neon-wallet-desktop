import type { TBlockchainServiceKey, TNetwork } from '@shared/types/blockchain'
import type { TSelectedNetworks } from '@shared/types/store'

export class SwapHelper {
  static readonly swapNetworkByBlockchainAndNetworkId: Map<string, string[]> = new Map([
    ['neo3-mainnet', ['neo3']],
    ['ethereum-1', ['eth']],
    ['neox-47763', ['']],
    ['polygon-137', ['matic']],
    ['base-8453', ['base', 'baseevm']],
    ['arbitrum-42161', ['arbitrum', 'arbevm', 'arbnova']],
  ])

  static getNetwork(blockchain: TBlockchainServiceKey, network: TNetwork) {
    const key = `${blockchain}-${network.id}`
    return this.swapNetworkByBlockchainAndNetworkId.get(key)
  }

  static getNetworks(networkByBlockchain: TSelectedNetworks) {
    const chainsByServiceName: Partial<Record<TBlockchainServiceKey, string[]>> = {}

    for (const networkBlockchain in networkByBlockchain) {
      const blockchain = networkBlockchain as TBlockchainServiceKey
      const network = networkByBlockchain[blockchain]

      const swapNetwork = this.getNetwork(blockchain, network)

      if (swapNetwork) {
        chainsByServiceName[blockchain] = swapNetwork
      }
    }

    return chainsByServiceName
  }
}
