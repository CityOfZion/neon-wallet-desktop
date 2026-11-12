import type { TBSServiceName } from '@cityofzion/bs-multichain'

import { BlockchainServiceHelper } from '@renderer/helpers/BlockchainServiceHelper'

import { TExchange } from '@shared/types/query'

export class ExchangeHelper {
  static getExchangeConvertedPrice(
    hash: string,
    blockchain: TBSServiceName,
    multiExchange?: {
      [x: string]: Map<string, TExchange | undefined>
    }
  ): number {
    if (!multiExchange) return 0

    const blockchainExchange = multiExchange[blockchain]

    if (!blockchainExchange) return 0

    const service = BlockchainServiceHelper.bsAggregator.blockchainServicesByName[blockchain]
    const exchange = blockchainExchange.get(service.tokenService.normalizeHash(hash))

    return exchange?.convertedPrice || 0
  }
}
