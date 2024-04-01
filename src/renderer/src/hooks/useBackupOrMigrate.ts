import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { BACKUP_FILE_EXTENSION } from '@renderer/constants/backup'
import { ToastHelper } from '@renderer/helpers/ToastHelper'
import zod from 'zod'

import { useModalNavigate } from './useModalRouter'

export type TMigrateAccountSchema = zod.infer<typeof migrateWalletsSchema>

type TFile = {
  path: string
  content: string | TMigrateAccountSchema[]
}

const migrateWalletsSchema = zod.object({
  address: zod.string(),
  label: zod.string(),
  isDefault: zod.boolean(),
  lock: zod.boolean(),
  key: zod.string(),
  contract: zod.any(),
  extra: zod.any(),
})

export const useBackupOrMigrate = () => {
  const { t } = useTranslation('hooks', { keyPrefix: 'useBackupOrMigrate' })
  const [file, setFile] = useState<TFile>()
  const [hasError, setHasError] = useState<boolean>(false)
  const { modalNavigate } = useModalNavigate()
  const navigate = useNavigate()

  const handleBrowse = async () => {
    const [filePath] = await window.api.openDialog({
      properties: ['openFile'],
      filters: [{ name: '', extensions: [BACKUP_FILE_EXTENSION, 'json'] }],
    })

    const fileContent = await window.api.readFile(filePath)

    if (filePath.endsWith(BACKUP_FILE_EXTENSION)) {
      ToastHelper.info({ message: t('neon3BackupFileDetected') })
      setFile({ path: filePath, content: fileContent })
      setHasError(false)
      return
    }

    try {
      const parsedContent = JSON.parse(fileContent)
      const validatedContent = await migrateWalletsSchema.array().parseAsync(parsedContent)
      ToastHelper.info({ message: t('neon2MigrateFileDetected') })
      setFile({ path: filePath, content: validatedContent })
      setHasError(false)
      return
    } catch {
      /* empty */
    }

    setHasError(true)
  }

  const handleImport = async () => {
    if (!file || hasError) return

    if (file.path.endsWith(BACKUP_FILE_EXTENSION)) {
      navigate('/settings/security/recover-wallet')
      modalNavigate('confirm-password-recover', { state: { content: file.content as string }, replace: true })
      return
    }

    navigate('/settings/security/migrate-accounts')
    modalNavigate('migrate-accounts-step-3', { state: { content: file.content as TMigrateAccountSchema[] } })
  }

  return {
    file,
    handleBrowse,
    handleImport,
    hasError,
  }
}
