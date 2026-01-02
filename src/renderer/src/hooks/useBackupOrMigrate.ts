import { useTranslation } from 'react-i18next'

import { NeonBackupHelper } from '@renderer/helpers/NeonBackupHelper'
import { ToastHelper } from '@renderer/helpers/ToastHelper'

import type { TUseNeonBackupData, TUseNeonBackupDeprecatedData, TUseNeonMigrateData } from '@shared/types/hooks'

import { useActions } from './useActions'
import { useNeonImportBackup } from './useNeonBackup'
import { useNeonImportMigrate } from './useNeonMigrate'

export type TUseBackupOrMigrateActionsData = {
  path?: string
} & (TUseNeonMigrateData | TUseNeonBackupData | TUseNeonBackupDeprecatedData | { content: undefined; type: undefined })

export const useBackupOrMigrate = () => {
  const { t } = useTranslation('hooks', { keyPrefix: 'useBackupOrMigrate' })
  const importBackupActions = useNeonImportBackup()
  const importMigrateActions = useNeonImportMigrate()

  const { actionData, actionState, handleAct, setData, setError, reset } = useActions<TUseBackupOrMigrateActionsData>({
    content: undefined,
    type: undefined,
    path: undefined,
  })

  const handleBrowse = async () => {
    const [filePath] = await window.api.sendAsync('openDialog', {
      properties: ['openFile'],
      filters: [
        {
          name: t('filterName'),
          extensions: [NeonBackupHelper.fileExtension, NeonBackupHelper.deprecatedFileExtension, 'json'],
        },
      ],
    })

    const fileContent = await window.api.sendAsync('readFile', filePath)

    const backupContent = await importBackupActions.validateAndParseFile(filePath, fileContent)

    if (backupContent) {
      ToastHelper.success({ message: t('neon3BackupFileDetected') })

      setData({ path: filePath, ...backupContent })
      return
    }

    const migrateContent = await importMigrateActions.validateAndParseFile(fileContent)
    if (migrateContent) {
      ToastHelper.success({ message: t('neon2MigrateFileDetected') })

      setData({ path: filePath, ...migrateContent })
      return
    }

    setError('path', t('error'))
    ToastHelper.error({ message: t('error'), id: 'file-backup-or-migrate-error' })
  }

  return {
    actionData,
    actionState,
    handleAct,
    handleBrowse,
    reset,
  }
}
