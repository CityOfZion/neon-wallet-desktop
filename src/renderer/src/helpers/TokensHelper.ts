import { BSTokenHelper } from '@cityofzion/blockchain-service'
import { bsAggregator } from '@renderer/libs/blockchainService'
import { TBlockchainServiceKey } from '@shared/@types/blockchain'

export class TokensHelper {
  static isNativeToken(hash: string, blockchain: TBlockchainServiceKey): boolean {
    const service = bsAggregator.blockchainServicesByName[blockchain]
    const normalizedHash = BSTokenHelper.normalizeHash(hash)

    return service.nativeTokens.some(token => BSTokenHelper.normalizeHash(token.hash) === normalizedHash)
  }
}
