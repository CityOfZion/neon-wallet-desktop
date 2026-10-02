import { BSNeoXConstants } from '@cityofzion/bs-neox'
import { useTranslation } from 'react-i18next'

import { Switch } from '@renderer/components/Switch'

import { NetworkHelper } from '@renderer/helpers/NetworkHelper'

import { useAppDispatch } from '@renderer/hooks/useRedux'
import { useSelectedNetworkProfileSelector } from '@renderer/hooks/useSettingsSelector'

import { settingsReducerActions } from '@renderer/store/reducers/settings'
import type { TBlockchainServiceKey } from '@shared/types/blockchain'

type TProps = {
  blockchain: TBlockchainServiceKey
}

export const DappPermissionAntiMevSwitch = ({ blockchain }: TProps) => {
  const { t } = useTranslation('modals', { keyPrefix: 'dappPermission' })
  const { selectedNetworkProfile } = useSelectedNetworkProfileSelector()
  const dispatch = useAppDispatch()

  const { id, url } = selectedNetworkProfile.networkByBlockchain[blockchain]

  if (blockchain !== 'neox') return null

  const handleAntiMevChange = (checked: boolean) => {
    const rpcUrls: string[] =
      BSNeoXConstants.RPC_LIST_BY_NETWORK_ID[id as keyof typeof BSNeoXConstants.RPC_LIST_BY_NETWORK_ID] ?? []

    let url: string

    if (checked) {
      url = rpcUrls.find(rpcUrl => NetworkHelper.isNeoxAntiMev({ blockchain, networkId: id, url: rpcUrl })) ?? ''
    } else {
      url = rpcUrls.find(rpcUrl => !NetworkHelper.isNeoxAntiMev({ blockchain, networkId: id, url: rpcUrl })) ?? ''
    }

    dispatch(
      settingsReducerActions.editNetworkProfile({
        id: selectedNetworkProfile.id,
        networkByBlockchain: { [blockchain]: { url, isAutomatic: false } },
      })
    )
  }

  return (
    <Switch.Root>
      <Switch.Label>{t('antiMevSwitchLabel')}</Switch.Label>
      <Switch.Control
        className="bg-gray-700/60"
        checked={NetworkHelper.isNeoxAntiMev({ blockchain, networkId: id, url })}
        onCheckedChange={handleAntiMevChange}
      />
    </Switch.Root>
  )
}
