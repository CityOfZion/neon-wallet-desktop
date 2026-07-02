import { useTranslation } from 'react-i18next'

import { ActionPopover } from '@renderer/components/ActionPopover'
import { IconButton } from '@renderer/components/IconButton'

import { ConstantsHelper } from '@renderer/helpers/ConstantsHelper'
import { TestHelper } from '@renderer/helpers/TestHelper'

import { useModalNavigate } from '@renderer/hooks/useModalRouter'
import { useSelectedNetworkProfileSelector } from '@renderer/hooks/useSettingsSelector'

import MdAdd from '@renderer/assets/images/md-add.svg?react'
import TbDotsVertical from '@renderer/assets/images/tb-dots-vertical.svg?react'
import TbPencil from '@renderer/assets/images/tb-pencil.svg?react'

export const NetworkProfileActions = () => {
  const { t } = useTranslation('pages', { keyPrefix: 'settings.settingsNetwork' })
  const { modalNavigateWrapper } = useModalNavigate()
  const { selectedNetworkProfile } = useSelectedNetworkProfileSelector()

  const isDefaultSelected = selectedNetworkProfile.id === ConstantsHelper.defaultNetworkProfileId

  return (
    <ActionPopover.Root>
      <ActionPopover.Trigger asChild>
        <IconButton
          icon={<TbDotsVertical aria-hidden />}
          size="md"
          compacted
          {...TestHelper.buildTestObject('network-profile-actions-button')}
        />
      </ActionPopover.Trigger>

      <ActionPopover.Content>
        <ActionPopover.Item
          leftIcon={<MdAdd aria-hidden />}
          onClick={modalNavigateWrapper('add-network-profile')}
          label={t('createProfileButtonLabel')}
          {...TestHelper.buildTestObject('network-profile-actions-create')}
        />

        {!isDefaultSelected && (
          <ActionPopover.Item
            leftIcon={<TbPencil aria-hidden />}
            iconsOnEdge={false}
            onClick={modalNavigateWrapper('add-network-profile', { state: { profile: selectedNetworkProfile } })}
            label={t('editProfileButtonLabel')}
            {...TestHelper.buildTestObject('network-profile-actions-edit')}
          />
        )}
      </ActionPopover.Content>
    </ActionPopover.Root>
  )
}
