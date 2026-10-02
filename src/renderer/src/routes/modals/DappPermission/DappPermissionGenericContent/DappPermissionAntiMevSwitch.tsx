import { useState } from 'react'

import { BSNeoXConstants } from '@cityofzion/bs-neox'
import { useTranslation } from 'react-i18next'

import { Switch } from '@renderer/components/Switch'

import { NetworkHelper } from '@renderer/helpers/NetworkHelper'
import { ToastHelper } from '@renderer/helpers/ToastHelper'

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

  const { id: selectedNetworkId, url: selectedNetworkUrl } = selectedNetworkProfile.networkByBlockchain[blockchain]

  const [isChecked, setIsChecked] = useState(
    NetworkHelper.isNeoxAntiMev({ blockchain, networkId: selectedNetworkId, url: selectedNetworkUrl })
  )

  if (blockchain !== 'neox') return null

  const handleAntiMevChange = (checked: boolean) => {
    const rpcUrls: string[] =
      BSNeoXConstants.RPC_LIST_BY_NETWORK_ID[
        selectedNetworkId as keyof typeof BSNeoXConstants.RPC_LIST_BY_NETWORK_ID
      ] ?? []

    let url: string | undefined

    if (checked) {
      url = rpcUrls.find(rpcUrl =>
        NetworkHelper.isNeoxAntiMev({ blockchain, networkId: selectedNetworkId, url: rpcUrl })
      )
    } else {
      url = rpcUrls.find(
        rpcUrl => !NetworkHelper.isNeoxAntiMev({ blockchain, networkId: selectedNetworkId, url: rpcUrl })
      )
    }

    if (!url) {
      ToastHelper.error({
        message: checked ? t('antiMevEnableUrlNotFoundError') : t('antiMevDisableUrlNotFoundError'),
      })
      return
    }

    setIsChecked(checked)
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
      <Switch.Control className="bg-gray-700/60" checked={isChecked} onCheckedChange={handleAntiMevChange} />
    </Switch.Root>
  )
}
