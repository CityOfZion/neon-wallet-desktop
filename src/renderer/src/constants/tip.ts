import { BSBigNumberHelper } from '@cityofzion/blockchain-service'
import { Token } from '@cityofzion/blockchain-service'
import { BSNeoLegacyConstants } from '@cityofzion/bs-neo-legacy'
import { BSNeo3Constants } from '@cityofzion/bs-neo3'
import { TBlockchainServiceKey } from '@shared/@types/blockchain'

type TTipConfigBlockchainData = {
  address: string
  token: Token
  minBn: BigNumber
}

type TTipConfig = {
  percentageBn: BigNumber
  blockchains: Partial<Record<TBlockchainServiceKey, TTipConfigBlockchainData>>
}

const MIN_GAS_TIP_BN = BSBigNumberHelper.fromNumber('0.00000001') // GAS has 8 decimals

export const TIP_CONFIG: TTipConfig = {
  percentageBn: BSBigNumberHelper.fromNumber('0.01'), // 1%
  blockchains: {
    neo3: {
      address: 'Na6zQi9giUtftPGbLeFn9nfuWjEMP98Trq',
      token: BSNeo3Constants.GAS_TOKEN,
      minBn: MIN_GAS_TIP_BN,
    },
    neoLegacy: {
      address: 'AZPLskUGhR5j7kT9T4ioMG2frzuLwxBw3p',
      token: BSNeoLegacyConstants.GAS_ASSET,
      minBn: MIN_GAS_TIP_BN,
    },
  },
}
