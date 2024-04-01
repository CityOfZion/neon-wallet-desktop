import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { MdOutlineSave } from 'react-icons/md'
import { Banner } from '@renderer/components/Banner'
import { Button } from '@renderer/components/Button'
import { Input } from '@renderer/components/Input'
import { useModalNavigate } from '@renderer/hooks/useModalRouter'
import { SettingsLayout } from '@renderer/layouts/Settings'

export const SettingsBackupWallet = () => {
  const { t } = useTranslation('pages', { keyPrefix: 'settings.settingsBackupWallet' })
  const { modalNavigateWrapper } = useModalNavigate()

  const [selectedFilePath, setSelectedFilePath] = useState<string>('')

  const handlePathSelectionButton = async () => {
    const result = await window.api.openDialog({ properties: ['openDirectory', 'createDirectory'] })
    setSelectedFilePath(result[0])
  }

  return (
    <SettingsLayout title={t('title')}>
      <p className="mb-7 text-xs">{t('description')}</p>

      <p className="uppercase text-gray-100 font-bold text-xs mb-3.5">{t('saveBackupLabel')}</p>

      <div className="flex flex-col flex-grow gap-y-10">
        <div className="flex gap-2.5">
          <Input value={selectedFilePath} compacted readOnly containerClassName="max-w-[17rem]" />

          <Button flat label={t('browse')} onClick={handlePathSelectionButton} className="w-36" />
        </div>

        <Banner type="info" message={t('warning')} />
      </div>

      <div className="flex justify-center">
        <Button
          label={t('backup')}
          leftIcon={<MdOutlineSave />}
          iconsOnEdge={false}
          disabled={!selectedFilePath}
          onClick={modalNavigateWrapper('confirm-password-backup', { state: { selectedFilePath } })}
          className="w-52"
        />
      </div>
    </SettingsLayout>
  )
}
