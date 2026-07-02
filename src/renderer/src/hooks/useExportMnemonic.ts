import { useTranslation } from 'react-i18next'

import { DateHelper } from '@renderer/helpers/DateHelper'

import { useLanguageSelector } from './useSettingsSelector'

export const useExportMnemonic = () => {
  const { t } = useTranslation('hooks', { keyPrefix: 'useExportMnemonic' })
  const { language } = useLanguageSelector()

  const saveMnemonicToTextFile = async (mnemonic: string, selectedFilePath: string) => {
    const fileName = `neon-mnemonic-${DateHelper.getCurrentFullDateString()}.txt`
    const content = t('fileTemplate', {
      mnemonic,
      generatedAt: DateHelper.formatLocalized(new Date(), { format: 'PPPp', language }),
    })

    await window.api.sendAsync('window:saveFile', {
      path: `${selectedFilePath}/${fileName}`,
      content,
    })
  }

  return { saveMnemonicToTextFile }
}
