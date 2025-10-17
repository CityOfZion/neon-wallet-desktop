import { bsAggregator } from '@renderer/libs/blockchain-service'
import { TBlockchainServiceKey } from '@shared/@types/blockchain'
import { TExchange } from '@shared/@types/query'

export class ExchangeHelper {
  static getExchangeConvertedPrice(
    hash: string,
    blockchain: TBlockchainServiceKey,
    multiExchange?: {
      [x: string]: Map<string, TExchange | undefined>
    }
  ): number {
    if (!multiExchange) return 0

    const blockchainExchange = multiExchange[blockchain]

    if (!blockchainExchange) return 0

    const service = bsAggregator.blockchainServicesByName[blockchain]
    const exchange = blockchainExchange.get(service.tokenService.normalizeHash(hash))

    return exchange?.convertedPrice ?? 0
  }
}
