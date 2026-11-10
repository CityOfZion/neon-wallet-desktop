import { useState } from 'react'

import { useTranslation } from 'react-i18next'

import { Banner } from '@renderer/components/Banner'
import { Button } from '@renderer/components/Button'
import { Input } from '@renderer/components/Input'
import { Tooltip } from '@renderer/components/Tooltip'

import { useModalNavigate } from '@renderer/hooks/useModalRouter'

import { SettingsLayout } from '@renderer/layouts/Settings'

import MdOutlineSave from '@renderer/assets/images/md-outline-save.svg?react'

const SettingsBackupWallet = () => {
  const { t } = useTranslation('pages', { keyPrefix: 'settings.settingsBackupWallet' })
  const { modalNavigateWrapper } = useModalNavigate()

  const [selectedFilePath, setSelectedFilePath] = useState('')

  const handlePathSelectionButton = async () => {
    const [result] = await window.api.sendAsync('window:openDialog', {
      properties: ['openDirectory', 'createDirectory'],
    })

    setSelectedFilePath(result)
  }

  return (
    <SettingsLayout title={t('title')}>
      <p className="mb-7 text-xs">{t('description')}</p>

      <div className="flex grow flex-col gap-y-6">
        <div className="flex w-fit items-end gap-2">
          <Tooltip title={selectedFilePath}>
            <Input
              label={t('saveBackupLabel')}
              placeholder={t('saveBackupPlaceholder')}
              value={selectedFilePath}
              compacted
              readOnly
              containerClassName="w-76"
            />
          </Tooltip>

          <Button flat label={t('browse')} type="button" onClick={handlePathSelectionButton} className="w-32" />
        </div>

        <Banner type="info" message={t('warning')} className="w-fit" />
      </div>

      <div className="flex justify-center">
        <Button
          label={t('backup')}
          className="w-52"
          iconsOnEdge={false}
          disabled={!selectedFilePath}
          leftIcon={<MdOutlineSave aria-hidden />}
          onClick={modalNavigateWrapper('confirm-password-backup', {
            state: { selectedFilePath, onSuccess: () => setSelectedFilePath('') },
          })}
        />
      </div>
    </SettingsLayout>
  )
}

export default SettingsBackupWallet
