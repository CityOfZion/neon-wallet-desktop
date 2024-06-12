import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { MdAdd, MdRestartAlt } from 'react-icons/md'
import { TbDotsVertical, TbPencil, TbReload } from 'react-icons/tb'
import { ActionPopover } from '@renderer/components/ActionPopover'
import { IconButton } from '@renderer/components/IconButton'
import { DEFAULT_NETWORK_BY__BLOCKCHAIN, DEFAULT_NETWORK_PROFILE } from '@renderer/constants/networks'
import { useModalNavigate } from '@renderer/hooks/useModalRouter'
import { useAppDispatch } from '@renderer/hooks/useRedux'
import {
  useSelectedNetworkByBlockchainSelector,
  useSelectedNetworkProfileSelector,
} from '@renderer/hooks/useSettingsSelector'
import { settingsReducerActions } from '@renderer/store/reducers/SettingsReducer'
import { isEqual } from 'lodash'

export const NetworkProfileActions = () => {
  const { t } = useTranslation('pages', { keyPrefix: 'settings.settingsNetwork' })
  const { modalNavigateWrapper } = useModalNavigate()
  const { selectedNetworkProfile } = useSelectedNetworkProfileSelector()
  const { networkByBlockchain } = useSelectedNetworkByBlockchainSelector()
  const dispatch = useAppDispatch()

  const shouldShowUpdate = useMemo(
    () => !isEqual(selectedNetworkProfile.networkByBlockchain, networkByBlockchain),
    [selectedNetworkProfile, networkByBlockchain]
  )

  const handleReset = () => {
    dispatch(
      settingsReducerActions.saveNetworkProfile({
        ...selectedNetworkProfile,
        networkByBlockchain: DEFAULT_NETWORK_BY__BLOCKCHAIN,
      })
    )
  }

  const handleUpdate = () => {
    dispatch(
      settingsReducerActions.saveNetworkProfile({
        ...selectedNetworkProfile,
        networkByBlockchain,
      })
    )
  }

  return (
    <ActionPopover.Root>
      <ActionPopover.Trigger asChild>
        <IconButton icon={<TbDotsVertical />} size="md" compacted />
      </ActionPopover.Trigger>

      <ActionPopover.Content>
        {shouldShowUpdate && (
          <ActionPopover.Item
            leftIcon={<TbReload />}
            iconsOnEdge={false}
            onClick={handleUpdate}
            label={t('updateProfileButtonLabel')}
          />
        )}

        <ActionPopover.Item
          leftIcon={<MdAdd />}
          onClick={modalNavigateWrapper('add-network-profile')}
          label={t('createProfileButtonLabel')}
        />

        {selectedNetworkProfile.id !== DEFAULT_NETWORK_PROFILE.id && (
          <ActionPopover.Item
            leftIcon={<TbPencil />}
            iconsOnEdge={false}
            onClick={modalNavigateWrapper('add-network-profile', { state: { profile: selectedNetworkProfile } })}
            label={t('editProfileButtonLabel')}
          />
        )}

        <ActionPopover.Item
          leftIcon={<MdRestartAlt />}
          iconsOnEdge={false}
          label={t('resetProfileButtonLabel')}
          onClick={handleReset}
        />
      </ActionPopover.Content>
    </ActionPopover.Root>
  )
}
