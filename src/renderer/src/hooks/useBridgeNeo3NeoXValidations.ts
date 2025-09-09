import { useMemo } from 'react'
import { hasNeo3NeoXBridge } from '@cityofzion/blockchain-service'
import { NetworkHelper } from '@renderer/helpers/NetworkHelper'
import { useSelectedNetworkByBlockchainSelector } from '@renderer/hooks/useSettingsSelector'
import { bsAggregator } from '@renderer/libs/blockchainService'
import { IAccountState } from '@shared/@types/store'

export const useBridgeNeo3NeoXValidations = (account?: IAccountState) => {
  const { networkByBlockchain } = useSelectedNetworkByBlockchainSelector()

  const canAccountBridge = useMemo(() => {
    const service = account ? bsAggregator.blockchainServicesByName[account.blockchain] : null

    return (
      !!service &&
      NetworkHelper.isMainnet(account!.blockchain, networkByBlockchain[account!.blockchain]) &&
      hasNeo3NeoXBridge(service)
    )
  }, [account, networkByBlockchain])

  return { canAccountBridge }
}
