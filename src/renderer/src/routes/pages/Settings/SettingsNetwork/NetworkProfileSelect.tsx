import { Fragment } from 'react'

import { useTranslation } from 'react-i18next'

import { Select } from '@renderer/components/Select'

import { TestHelper } from '@renderer/helpers/TestHelper'

import { useAppDispatch } from '@renderer/hooks/useRedux'
import { useNetworkProfilesSelector, useSelectedNetworkProfileSelector } from '@renderer/hooks/useSettingsSelector'

import { settingsReducerActions } from '@renderer/store/reducers/settings'

export const NetworkProfileSelect = () => {
  const { t } = useTranslation('pages', { keyPrefix: 'settings.settingsNetwork' })
  const { networkProfiles } = useNetworkProfilesSelector()
  const { selectedNetworkProfile } = useSelectedNetworkProfileSelector()
  const dispatch = useAppDispatch()

  const handleSelect = (id: string) => {
    dispatch(settingsReducerActions.setSelectNetworkProfile(id))
  }

  return (
    <Select.Root value={selectedNetworkProfile.id} onValueChange={handleSelect}>
      <Select.Trigger className="bg-asphalt max-w-46.5" {...TestHelper.buildTestObject('network-profile-select')}>
        <Select.Value placeholder={t('selectProfilePlaceholder')} />

        <Select.Icon className="text-neon" />
      </Select.Trigger>

      <Select.Content>
        {networkProfiles.map((profile, index) => (
          <Fragment key={`network-profile-${profile.id}`}>
            <Select.Item
              value={profile.id}
              className="flex items-center justify-start gap-x-2 text-sm text-gray-100 hover:bg-gray-300/15 focus:bg-gray-300/15"
              {...TestHelper.buildTestObject('network-profile-select-item')}
            >
              <Select.ItemText>{profile.name}</Select.ItemText>
            </Select.Item>

            {index + 1 !== networkProfiles.length && <Select.Separator />}
          </Fragment>
        ))}
      </Select.Content>
    </Select.Root>
  )
}
