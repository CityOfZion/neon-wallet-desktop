import cloneDeep from 'lodash/cloneDeep'
import isEqual from 'lodash/isEqual'

import { BlockchainServiceHelper } from '@renderer/helpers/BlockchainServiceHelper'

import { useMountUnsafe } from '@renderer/hooks/useMount'
import { useLazyPingNodes } from '@renderer/hooks/useNodes'
import { useAppDispatch } from '@renderer/hooks/useRedux'
import {
  useSelectedNetworkByBlockchainSelector,
  useSelectedNetworkProfileSelector,
} from '@renderer/hooks/useSettingsSelector'

import { settingsReducerActions } from '@renderer/store/reducers/settings'

const NetworkManagerSetup = () => {
  const dispatch = useAppDispatch()
  const { getPingNodes } = useLazyPingNodes()
  const { networkByBlockchain } = useSelectedNetworkByBlockchainSelector()
  const { selectedNetworkProfile } = useSelectedNetworkProfileSelector()

  useMountUnsafe(async () => {
    const services = Object.values(BlockchainServiceHelper.bsAggregator.blockchainServicesByName)

    const updatedNetworks = cloneDeep(networkByBlockchain)

    const promises = services.map(async service => {
      const currentNetwork = updatedNetworks[service.name]

      try {
        await service.pingNode(currentNetwork.url)
      } catch {
        const nodes = await getPingNodes(service.name)

        const newNode = nodes[0]
        if (!newNode) return

        updatedNetworks[service.name] = {
          ...currentNetwork,
          url: newNode.url,
        }
      }
    })

    await Promise.allSettled(promises)

    if (!isEqual(updatedNetworks, networkByBlockchain)) {
      dispatch(
        settingsReducerActions.editNetworkProfile({
          id: selectedNetworkProfile.id,
          networkByBlockchain: updatedNetworks,
        })
      )
    }
  })

  return null
}

export default NetworkManagerSetup
