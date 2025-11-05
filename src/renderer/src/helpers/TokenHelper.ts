import { bsAggregator } from '@renderer/libs/blockchain-service'
import { TBlockchainServiceKey } from '@shared/@types/blockchain'

export class TokenHelper {
  static isNativeToken(hash: string, blockchain: TBlockchainServiceKey): boolean {
    const service = bsAggregator.blockchainServicesByName[blockchain]

    return service.nativeTokens.some(token => service.tokenService.predicateByHash(hash, token))
  }
}
