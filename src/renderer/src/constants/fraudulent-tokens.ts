import { BSTokenHelper } from '@cityofzion/blockchain-service'
import { TBlockchainServiceKey } from '@shared/@types/blockchain'

export const FRAUDULENT_TOKEN_HASHES_BY_BLOCKCHAIN: Partial<Record<TBlockchainServiceKey, Set<string>>> = {
  neo3: new Set([
    BSTokenHelper.normalizeHash('0x42e6b0379e39a428362e08cf9d7e40903cdb0fe7'), // $GAS Airdrop | stadlelabs.com
  ]),
}
