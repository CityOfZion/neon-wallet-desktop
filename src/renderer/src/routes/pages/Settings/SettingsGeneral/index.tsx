import { useTranslation } from 'react-i18next'

import { Checkbox } from '@renderer/components/Checkbox'

import { useLoginSessionSelector, useShouldConfirmActionSelector } from '@renderer/hooks/useAuthSelector'
import { useAppDispatch } from '@renderer/hooks/useRedux'

import { SettingsLayout } from '@renderer/layouts/Settings'

import { authReducerActions } from '@renderer/store/reducers/auth'

const SettingsGeneral = () => {
  const { t } = useTranslation('pages', { keyPrefix: 'settings.settingsGeneral' })
  const { shouldConfirmAction } = useShouldConfirmActionSelector()
  const { loginSession } = useLoginSessionSelector()
  const dispatch = useAppDispatch()

  const handleIsShouldConfirmActionChange = (value: boolean) => {
    dispatch(authReducerActions.setShouldConfirmAction(value))
  }

  return (
    <SettingsLayout title={t('title')}>
      <div className="ml-2 flex items-center gap-2">
        <Checkbox
          disabled={loginSession?.type === 'hardware'}
          id="should-confirm-action"
          checked={shouldConfirmAction}
          onCheckedChange={handleIsShouldConfirmActionChange}
        />
        <label htmlFor="should-confirm-action">
          {loginSession?.type === 'password'
            ? t('shouldConfirmActionPasswordCheckbox')
            : t('shouldConfirmActionKeyCheckbox')}
        </label>
      </div>
    </SettingsLayout>
  )
}

export default SettingsGeneral
