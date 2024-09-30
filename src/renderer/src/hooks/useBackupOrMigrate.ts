import { useTranslation } from 'react-i18next'
import { hasNameService } from '@cityofzion/blockchain-service'
import { BACKUP_FILE_EXTENSION } from '@renderer/constants/backup'
import { ToastHelper } from '@renderer/helpers/ToastHelper'
import { bsAggregator } from '@renderer/libs/blockchainService'
import { getI18next } from '@renderer/libs/i18next'
import { TBlockchainServiceKey } from '@shared/@types/blockchain'
import zod from 'zod'

import { useActions } from './useActions'

export type TMigrateAccountsSchema = {
  address: string
  label: string
  key: string
  blockchain: TBlockchainServiceKey
}
export type TMigrateContactsSchema = {
  addresses: { address: string; blockchain: TBlockchainServiceKey }[]
  name: string
}
export type TMigrateSchema = zod.infer<typeof migrateSchema>

export type TUseBackupOrMigrateActionsData = {
  path?: string
  content?: string | TMigrateSchema
  type?: 'backup' | 'migrate'
}

const { t } = getI18next()

const migrateAccountsSchema = zod.object({
  address: zod.string().nullish(),
  label: zod.string().nullish(),
  key: zod.string().nullish(),
})

const migrateContactsSchema = zod.object({ name: zod.string().nullish(), addresses: zod.array(zod.string()).nullish() })

const migrateSchema = zod
  .object({
    accounts: zod.array(migrateAccountsSchema),
    contacts: zod.array(migrateContactsSchema),
  })
  .transform(data => {
    const transformedAccounts: TMigrateAccountsSchema[] = []

    data.accounts.forEach(({ label, address, key }) => {
      if (!address || !key || transformedAccounts.some(account => account.address === address || account.key === key))
        return

      const [blockchain] = bsAggregator.getBlockchainNameByAddress(address)

      if (!blockchain) return

      transformedAccounts.push({
        address,
        key,
        label: label || t('hooks:useBackupOrMigrate.defaultAccountLabel'),
        blockchain,
      })
    })

    const transformedContacts = data.contacts.map<TMigrateContactsSchema>(contact => {
      const transformedAddresses: TMigrateContactsSchema['addresses'] = []
      const blockchainServices = Object.values(bsAggregator.blockchainServicesByName)

      contact.addresses?.forEach(address => {
        for (const service of blockchainServices) {
          if (
            (hasNameService(service) && service.validateNameServiceDomainFormat(address)) ||
            service.validateAddress(address)
          ) {
            transformedAddresses.push({ address, blockchain: service.blockchainName })
            return
          }
        }
      })

      return { name: contact.name ?? t('hooks:useBackupOrMigrate.defaultContactName'), addresses: transformedAddresses }
    })

    return {
      accounts: transformedAccounts,
      contacts: transformedContacts,
    }
  })

export const useBackupOrMigrate = () => {
  const { t } = useTranslation('hooks', { keyPrefix: 'useBackupOrMigrate' })

  const { actionData, actionState, handleAct, setData, setError, reset } = useActions<TUseBackupOrMigrateActionsData>(
    {}
  )

  const handleBrowse = async () => {
    const [filePath] = await window.api.sendAsync('openDialog', {
      properties: ['openFile'],
      filters: [{ name: `${BACKUP_FILE_EXTENSION}, json`, extensions: [BACKUP_FILE_EXTENSION, 'json'] }],
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
