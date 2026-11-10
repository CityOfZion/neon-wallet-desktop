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

const defaultInitialActionsData: TUseImportFromFileActionsData = {
  content: undefined,
  type: undefined,
  path: undefined,
}

export const useImportFromFile = (initialActionsData?: TUseImportFromFileActionsData) => {
  const { t } = useTranslation('hooks', { keyPrefix: 'useImportFromFile' })
  const neonBackupFileActions = useNeonBackupFile()
  const neonMigrateFileActions = useNeonMigrateFile()
  const nep6BackupFileActions = useNep6BackupFile()

  const {
    actionData,
    actionState,
    setData,
    setError,
    reset: actionsReset,
    handleAct,
  } = useActions<TUseImportFromFileActionsData>(initialActionsData || defaultInitialActionsData)

  const reset = () => {
    actionsReset()
    setData(defaultInitialActionsData)
  }

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
      setData({ ...backupContent, path: filePath })

      return
    }

    const nep6BackupContent = await nep6BackupFileActions.validateAndParseBackupFile(fileContent)

    if (nep6BackupContent) {
      setData({ ...nep6BackupContent, path: filePath })

      return
    }

    const migrationContent = await neonMigrateFileActions.validateAndParseMigrateFile(fileContent)

    if (migrationContent) {
      setData({ ...migrationContent, path: filePath })

      return
    }

    setError('path', t('error'))
    ToastHelper.error({ message: t('error') })
  }

  return {
    actionData,
    actionState,
    reset,
    handleAct,
    handleBrowse,
  }
}
