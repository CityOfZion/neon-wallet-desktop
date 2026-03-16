import cloneDeep from 'lodash/cloneDeep'
import isEqual from 'lodash/isEqual'

import { BlockchainServiceHelper } from '@renderer/helpers/BlockchainServiceHelper'

import { useMountUnsafe } from '@renderer/hooks/useMount'
import { useLazyPingNetworks } from '@renderer/hooks/usePingNetworks'
import { useAppDispatch } from '@renderer/hooks/useRedux'
import {
  useSelectedNetworkByBlockchainSelector,
  useSelectedNetworkProfileSelector,
} from '@renderer/hooks/useSettingsSelector'

import { settingsReducerActions } from '@renderer/store/reducers/settings'

const NetworkManagerSetup = () => {
  const dispatch = useAppDispatch()
  const { getPingNetworks } = useLazyPingNetworks()
  const { networkByBlockchain } = useSelectedNetworkByBlockchainSelector()
  const { selectedNetworkProfile } = useSelectedNetworkProfileSelector()

  useMountUnsafe(async () => {
    const services = Object.values(BlockchainServiceHelper.bsAggregator.blockchainServicesByName)

    const updatedNetworks = cloneDeep(networkByBlockchain)

    const promises = services.map(async service => {
      const currentNetwork = updatedNetworks[service.name]

      try {
        await service.pingNetwork(currentNetwork.url)
      } catch {
        const networks = await getPingNetworks(service.name)
        const [newNetwork] = networks

        if (!newNetwork) return

        updatedNetworks[service.name] = {
          ...currentNetwork,
          url: newNetwork.url,
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
