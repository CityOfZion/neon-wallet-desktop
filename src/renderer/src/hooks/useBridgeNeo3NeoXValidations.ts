import { useMemo } from 'react'

import { hasNeo3NeoXBridge } from '@cityofzion/blockchain-service'

import { useSelectedNetworkByBlockchainSelector } from '@renderer/hooks/useSettingsSelector'

import { bsAggregator } from '@renderer/libs/blockchain-service'
import { IAccountState } from '@shared/types/store'

export const useBridgeNeo3NeoXValidations = (account?: IAccountState) => {
  const { networkByBlockchain } = useSelectedNetworkByBlockchainSelector()

  const canAccountBridge = useMemo(() => {
    const service = account ? bsAggregator.blockchainServicesByName[account.blockchain] : null

    return !!service && networkByBlockchain[account!.blockchain].type === 'mainnet' && hasNeo3NeoXBridge(service)
  }, [account, networkByBlockchain])

  return { canAccountBridge }
}
