import type { TBSServiceName } from '@cityofzion/bs-multichain'

import { BlockchainServiceHelper } from '@renderer/helpers/BlockchainServiceHelper'

export class TokenHelper {
  static getKey(tokenHash: string, blockchain: TBSServiceName): string {
    const service = BlockchainServiceHelper.bsAggregator.blockchainServicesByName[blockchain]
    const normalizedTokenHash = service.tokenService.normalizeHash(tokenHash)

    return `${normalizedTokenHash}-${blockchain}`
  }
}
