import { TBlockchainServiceKey } from '@shared/@types/blockchain'
import { TMultiExchange } from '@shared/@types/query'

import { UtilsHelper } from './UtilsHelper'

export class ExchangeHelper {
  static getExchangeConvertedPrice(
    hash: string,
    blockchain: TBlockchainServiceKey,
    multiExchange?: TMultiExchange
  ): number {
    if (!multiExchange) return 0

    const blockchainExchange = multiExchange[blockchain]
    if (!blockchainExchange) return 0

    const exchange = blockchainExchange.get(UtilsHelper.normalizeHash(hash))

    return exchange?.convertedPrice ?? 0
  }
}
