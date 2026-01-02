import { useState } from 'react'

import { useTranslation } from 'react-i18next'

import { RadioGroup } from '@renderer/components/RadioGroup'

import { LanguageHelper } from '@renderer/helpers/LanguageHelper'

import { useAppDispatch } from '@renderer/hooks/useRedux'
import { useLanguageSelector } from '@renderer/hooks/useSettingsSelector'

import { SettingsLayout } from '@renderer/layouts/Settings'

import { settingsReducerActions } from '@renderer/store/reducers/settings'
import { TAvailableLanguages, TLanguage } from '@shared/types/store'

const SettingsLanguage = () => {
  const { t } = useTranslation('pages', { keyPrefix: 'settings.settingsLanguage' })
  const { language } = useLanguageSelector()
  const dispatch = useAppDispatch()

  const [selectedLanguage, setSelectedLanguage] = useState<TLanguage>(language)

  const onSelectRadioItem = (selectedValue: TAvailableLanguages) => {
    const selectedLanguage = LanguageHelper.availableLanguages.find(language => language.label === selectedValue)

    if (!selectedLanguage) return

    setSelectedLanguage(selectedLanguage)
    dispatch(settingsReducerActions.setLanguage(selectedLanguage))
  }

  return (
    <SettingsLayout title={t('title')}>
      <RadioGroup.Group value={selectedLanguage.label} onValueChange={onSelectRadioItem}>
        {LanguageHelper.availableLanguages.map(language => (
          <RadioGroup.Item key={language.label} value={language.label}>
            <div className="flex gap-x-2">
              <label>{language.label}</label>
            </div>
            <RadioGroup.Indicator />
          </RadioGroup.Item>
        ))}
      </RadioGroup.Group>
    </SettingsLayout>
  )
}

export default SettingsLanguage
