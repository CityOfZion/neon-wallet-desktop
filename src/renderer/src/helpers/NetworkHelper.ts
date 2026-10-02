import { BSNeoXConstants } from '@cityofzion/bs-neox'

import type { TNetworkHelperIsNeoxAntiMevParams } from '@shared/types/helpers'

export class NetworkHelper {
  static readonly defaultNetworkProfileId = 'default'

  static isNeoxAntiMev({ blockchain, networkId, url }: TNetworkHelperIsNeoxAntiMevParams) {
    if (blockchain !== 'neox') return false

    const antiMevUrls: string[] | undefined =
      BSNeoXConstants.ANTI_MEV_RPC_LIST_BY_NETWORK_ID[
        networkId as keyof typeof BSNeoXConstants.ANTI_MEV_RPC_LIST_BY_NETWORK_ID
      ]

    return !!antiMevUrls?.includes(url)
  }
}
