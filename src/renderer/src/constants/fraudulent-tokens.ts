import { bsAggregator } from '@renderer/libs/blockchainService'
import { TBlockchainServiceKey } from '@shared/@types/blockchain'

const neo3Service = bsAggregator.blockchainServicesByName.neo3

export const FRAUDULENT_TOKEN_HASHES_BY_BLOCKCHAIN: Partial<Record<TBlockchainServiceKey, Set<string>>> = {
  neo3: new Set([
    neo3Service.tokenService.normalizeHash('0x42e6b0379e39a428362e08cf9d7e40903cdb0fe7'), // $GAS Airdrop | stadlelabs.com
  ]),
}
