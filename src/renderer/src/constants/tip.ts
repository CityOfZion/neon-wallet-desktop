import { BSBigNumberHelper } from '@cityofzion/blockchain-service'
import { TBSToken } from '@cityofzion/blockchain-service'
import { BSNeo3Constants } from '@cityofzion/bs-neo3'

import { TBlockchainServiceKey } from '@shared/types/blockchain'

type TTipConfigBlockchainData = {
  address: string
  token: TBSToken
  minBn: BigNumber
}

type TTipConfig = {
  percentageBn: BigNumber
  blockchains: Partial<Record<TBlockchainServiceKey, TTipConfigBlockchainData>>
}

export const TIP_CONFIG: TTipConfig = {
  percentageBn: BSBigNumberHelper.fromNumber('0.01'), // 1%
  blockchains: {
    neo3: {
      address: 'Na6zQi9giUtftPGbLeFn9nfuWjEMP98Trq',
      token: BSNeo3Constants.GAS_TOKEN,
      minBn: BSBigNumberHelper.fromNumber('0.00000001'), // GAS has 8 decimals
    },
  },
}
