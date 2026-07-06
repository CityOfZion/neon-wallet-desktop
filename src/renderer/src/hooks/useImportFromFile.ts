import { useTranslation } from 'react-i18next'

import { NeonBackupHelper } from '@renderer/helpers/NeonBackupHelper'
import { ToastHelper } from '@renderer/helpers/ToastHelper'

import type {
  TUseNeonBackupData,
  TUseNeonBackupDeprecatedData,
  TUseNeonMigrateData,
  TUseNep6Data,
} from '@shared/types/hooks'

import { useActions } from './useActions'
import { useNeonBackupFile } from './useNeonBackupFile'
import { useNeonMigrateFile } from './useNeonMigrateFile'
import { useNep6BackupFile } from './useNep6BackupFile'

export type TUseImportFromFileActionsData = {
  path?: string
} & (
  | TUseNeonMigrateData
  | TUseNep6Data
  | TUseNeonBackupData
  | TUseNeonBackupDeprecatedData
  | { content: undefined; type: undefined }
)

export const useImportFromFile = () => {
  const { t } = useTranslation('hooks', { keyPrefix: 'useImportFromFile' })
  const neonBackupFileActions = useNeonBackupFile()
  const neonMigrateFileActions = useNeonMigrateFile()
  const nep6BackupFileActions = useNep6BackupFile()

  const { actionData, actionState, handleAct, setData, setError, reset } = useActions<TUseImportFromFileActionsData>({
    content: undefined,
    type: undefined,
    path: undefined,
  })

  const handleBrowse = async () => {
    const [filePath] = await window.api.sendAsync('window:openDialog', {
      properties: ['openFile'],
      filters: [
        {
          name: t('filterName'),
          extensions: [NeonBackupHelper.fileExtension, NeonBackupHelper.deprecatedFileExtension, 'json'],
        },
      ],
    })

    const fileContent = await window.api.sendAsync('window:readFile', filePath)

    const backupContent = await neonBackupFileActions.validateAndParseBackupFile(filePath, fileContent)

    if (backupContent) {
      ToastHelper.success({ message: t('neonBackupFileDetected') })

      setData({ ...backupContent, path: filePath })
      return
    }

    const nep6BackupContent = await nep6BackupFileActions.validateAndParseBackupFile(fileContent)

    if (nep6BackupContent) {
      ToastHelper.success({ message: t('nep6BackupFileDetected') })

      setData({ ...nep6BackupContent, path: filePath })
      return
    }

    const migrationContent = await neonMigrateFileActions.validateAndParseMigrateFile(fileContent)

    if (migrationContent) {
      ToastHelper.success({ message: t('neon2MigrateFileDetected') })

      setData({ ...migrationContent, path: filePath })
      return
    }

    setError('path', t('error'))
    ToastHelper.error({ message: t('error') })
  }

  return {
    actionData,
    actionState,
    handleAct,
    handleBrowse,
    reset,
  }
}
