import { TSwapToken } from '@cityofzion/blockchain-service'

import { BlockchainServiceHelper } from '@renderer/helpers/BlockchainServiceHelper'

import { TBlockchainServiceKey } from '@shared/types/blockchain'

export class TokenHelper {
  static getKey(tokenHash: string, blockchain: TBlockchainServiceKey): string {
    const service = BlockchainServiceHelper.bsAggregator.blockchainServicesByName[blockchain]
    const normalizedTokenHash = service.tokenService.normalizeHash(tokenHash)

    return `${normalizedTokenHash}-${blockchain}`
  }

  static isNonNativeStellarToken(token: TSwapToken<TBlockchainServiceKey>): token is TSwapToken<'stellar'> {
    const stellarService = BlockchainServiceHelper.bsAggregator.blockchainServicesByName.stellar

    return token.blockchain === 'stellar' && !!token.hash && !stellarService.tokenService.isNativeToken(token.hash)
  }
}
