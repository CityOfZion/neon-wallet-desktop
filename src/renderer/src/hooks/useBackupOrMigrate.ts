import { useTranslation } from 'react-i18next'
import { hasNameService } from '@cityofzion/blockchain-service'
import { BACKUP_FILE_EXTENSION } from '@renderer/constants/backup'
import { ToastHelper } from '@renderer/helpers/ToastHelper'
import { bsAggregator } from '@renderer/libs/blockchainService'
import { TBlockchainServiceKey } from '@shared/@types/blockchain'
import zod from 'zod'

import { useActions } from './useActions'

export type TMigrateAccountsSchema = zod.infer<typeof migrateAccountsSchema>
export type TMigrateSchema = zod.infer<typeof migrateSchema>

export type TUseBackupOrMigrateActionsData = {
  path?: string
  content?: string | TMigrateSchema
  type?: 'backup' | 'migrate'
}

const migrateAccountsSchema = zod
  .object({
    address: zod.string(),
    label: zod.string(),
    isDefault: zod.boolean(),
    lock: zod.boolean(),
    key: zod.string(),
    contract: zod.any(),
    extra: zod.any(),
  })
  .transform(data => {
    const blockchain = bsAggregator.getBlockchainNameByAddress(data.address)[0] as TBlockchainServiceKey | undefined
    return {
      ...data,
      blockchain,
    }
  })

const migrateContactsSchema = zod.object({ name: zod.string(), addresses: zod.array(zod.string()) }).transform(data => {
  const addressesWithBlockchain = data.addresses.map(address => {
    let blockchain: TBlockchainServiceKey | undefined

    for (const service of Object.values(bsAggregator.blockchainServicesByName)) {
      if (
        (hasNameService(service) && service.validateNameServiceDomainFormat(address)) ||
        service.validateAddress(address)
      ) {
        blockchain = service.blockchainName
        break
      }
    }

    return { address, blockchain }
  })

  return { ...data, addresses: addressesWithBlockchain }
})

const migrateSchema = zod.object({
  accounts: zod.array(migrateAccountsSchema),
  contacts: zod.array(migrateContactsSchema),
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

      setData({
        path: filePath,
        content: validatedContent,
        type: 'migrate',
      })
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
