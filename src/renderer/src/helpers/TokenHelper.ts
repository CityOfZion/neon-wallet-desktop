import { BlockchainServiceHelper } from '@renderer/helpers/BlockchainServiceHelper'

import { TBlockchainServiceKey } from '@shared/types/blockchain'

export class TokenHelper {
  static getKey(tokenHash: string, blockchain: TBlockchainServiceKey): string {
    const service = BlockchainServiceHelper.bsAggregator.blockchainServicesByName[blockchain]
    const normalizedTokenHash = service.tokenService.normalizeHash(tokenHash)

    return `${normalizedTokenHash}-${blockchain}`
  }
}
