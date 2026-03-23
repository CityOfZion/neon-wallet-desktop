import { BlockchainServiceHelper } from '@renderer/helpers/BlockchainServiceHelper'

import { TBlockchainServiceKey } from '@shared/types/blockchain'

export class TokenHelper {
  static isNativeToken(hash: string, blockchain: TBlockchainServiceKey): boolean {
    const service = BlockchainServiceHelper.bsAggregator.blockchainServicesByName[blockchain]

    return service.nativeTokens.some(token => service.tokenService.predicateByHash(hash, token))
  }

  static isValidTokenHash(hash?: string): hash is string {
    const trimmedHash = hash?.trim()

    if (!trimmedHash) return false

    return trimmedHash.toLowerCase() !== '0x'
  }

  static fallbackTokenHash(hash: string) {
    return this.isValidTokenHash(hash) ? hash : '--'
  }
}
