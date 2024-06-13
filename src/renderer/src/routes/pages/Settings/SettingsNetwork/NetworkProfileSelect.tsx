import { Fragment } from 'react'
import { useTranslation } from 'react-i18next'
import { Select } from '@renderer/components/Select'
import { StyleHelper } from '@renderer/helpers/StyleHelper'
import { useAppDispatch } from '@renderer/hooks/useRedux'
import { useNetworkProfilesSelector, useSelectedNetworkProfileSelector } from '@renderer/hooks/useSettingsSelector'
import { settingsReducerActions } from '@renderer/store/reducers/SettingsReducer'

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
      <Select.Trigger className={StyleHelper.mergeStyles('bg-asphalt')}>
        <Select.Value placeholder={t('selectProfilePlaceholder')} />

        <Select.Icon className="text-neon" />
      </Select.Trigger>

      <Select.Content>
        {networkProfiles.map((profile, index) => (
          <Fragment key={`network-profile-${profile.id}`}>
            <Select.Item
              value={profile.id}
              className="hover:bg-gray-300/15 flex gap-x-2 items-center cursor-pointer justify-start text-gray-100 text-sm"
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
