import { useTranslation } from 'react-i18next'
import { BACKUP_FILE_EXTENSION } from '@renderer/constants/backup'
import { ToastHelper } from '@renderer/helpers/ToastHelper'
import zod from 'zod'

import { useActions } from './useActions'

export type TMigrateWalletsSchema = zod.infer<typeof migrateWalletsSchema>
export type TMigrateSchema = zod.infer<typeof migrateSchema>

export type TUseBackupOrMigrateActionsData = {
  path?: string
  content?: string | TMigrateSchema
  type?: 'backup' | 'migrate'
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

const migrateSchema = zod.object({
  accounts: zod.array(migrateWalletsSchema),
  contacts: zod.array(zod.object({ name: zod.string(), addresses: zod.array(zod.string()) })),
})

export const useBackupOrMigrate = () => {
  const { t } = useTranslation('hooks', { keyPrefix: 'useBackupOrMigrate' })

  const { actionData, actionState, handleAct, setData, setError, reset } = useActions<TUseBackupOrMigrateActionsData>(
    {}
  )

  const handleBrowse = async () => {
    const [filePath] = await window.api.sendAsync('openDialog', {
      properties: ['openFile'],
      filters: [{ name: '', extensions: [BACKUP_FILE_EXTENSION, 'json'] }],
    })

    const fileContent = await window.api.sendAsync('readFile', filePath)

    if (filePath.endsWith(BACKUP_FILE_EXTENSION)) {
      ToastHelper.success({ message: t('neon3BackupFileDetected') })

      setData({ path: filePath, content: fileContent, type: 'backup' })
      return
    }

    try {
      const parsedContent = JSON.parse(fileContent)
      const validatedContent = await migrateSchema.parseAsync(parsedContent)

      ToastHelper.success({ message: t('neon2MigrateFileDetected') })

      setData({ path: filePath, content: validatedContent, type: 'migrate' })
      return
    } catch {
      /* empty */
    }

    setError('path', t('error'))
  }

  return {
    actionData,
    actionState,
    handleAct,
    handleBrowse,
    reset,
  }
}
