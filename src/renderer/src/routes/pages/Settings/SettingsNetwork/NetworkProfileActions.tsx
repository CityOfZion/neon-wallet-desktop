import { useTranslation } from 'react-i18next'
import MdAdd from '@renderer/assets/images/md-add.svg?react'
import MdRestartAlt from '@renderer/assets/images/md-restart-alt.svg?react'
import TbDotsVertical from '@renderer/assets/images/tb-dots-vertical.svg?react'
import TbPencil from '@renderer/assets/images/tb-pencil.svg?react'
import { ActionPopover } from '@renderer/components/ActionPopover'
import { IconButton } from '@renderer/components/IconButton'
import { DEFAULT_NETWORK_BY__BLOCKCHAIN, DEFAULT_NETWORK_PROFILE } from '@renderer/constants/networks'
import { useModalNavigate } from '@renderer/hooks/useModalRouter'
import { useAppDispatch } from '@renderer/hooks/useRedux'
import { useSelectedNetworkProfileSelector } from '@renderer/hooks/useSettingsSelector'
import { settingsReducerActions } from '@renderer/store/reducers/SettingsReducer'

export const NetworkProfileActions = () => {
  const { t } = useTranslation('pages', { keyPrefix: 'settings.settingsNetwork' })
  const { modalNavigateWrapper } = useModalNavigate()
  const { selectedNetworkProfile } = useSelectedNetworkProfileSelector()
  const dispatch = useAppDispatch()

  const isDefaultSelected = selectedNetworkProfile.id === DEFAULT_NETWORK_PROFILE.id

  const handleReset = () => {
    dispatch(
      settingsReducerActions.saveNetworkProfile({
        ...selectedNetworkProfile,
        networkByBlockchain: DEFAULT_NETWORK_BY__BLOCKCHAIN,
      })
    )
  }

  return (
    <ActionPopover.Root>
      <ActionPopover.Trigger asChild>
        <IconButton icon={<TbDotsVertical />} size="md" compacted />
      </ActionPopover.Trigger>

      <ActionPopover.Content>
        <ActionPopover.Item
          leftIcon={<MdAdd />}
          onClick={modalNavigateWrapper('add-network-profile')}
          label={t('createProfileButtonLabel')}
        />

        {!isDefaultSelected && (
          <ActionPopover.Item
            leftIcon={<TbPencil />}
            iconsOnEdge={false}
            onClick={modalNavigateWrapper('add-network-profile', { state: { profile: selectedNetworkProfile } })}
            label={t('editProfileButtonLabel')}
          />
        )}

        {!isDefaultSelected && (
          <ActionPopover.Item
            leftIcon={<MdRestartAlt />}
            iconsOnEdge={false}
            label={t('resetProfileButtonLabel')}
            onClick={handleReset}
          />
        )}
      </ActionPopover.Content>
    </ActionPopover.Root>
  )
}
