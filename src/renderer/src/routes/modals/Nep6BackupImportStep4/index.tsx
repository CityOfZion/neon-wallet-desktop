import { Fragment, useState } from 'react'

import { useTranslation } from 'react-i18next'

import { Button } from '@renderer/components/Button'
import { Checkbox } from '@renderer/components/Checkbox'
import { ImportPasswordRow } from '@renderer/components/ImportPasswordRow'
import { ImportSharedPassword } from '@renderer/components/ImportSharedPassword'
import { ImportSuccessContent } from '@renderer/components/ImportSuccessContent'
import { Separator } from '@renderer/components/Separator'

import { LoggerHelper } from '@renderer/helpers/LoggerHelper'
import { ToastHelper } from '@renderer/helpers/ToastHelper'

import { useActions } from '@renderer/hooks/useActions'
import { useModalNavigate, useModalState } from '@renderer/hooks/useModalRouter'
import { useNep6BackupFile } from '@renderer/hooks/useNep6BackupFile'

import { ImportModalLayout } from '@renderer/layouts/ImportModalLayout'

import TbPackageImport from '@renderer/assets/images/tb-package-import.svg?react'

import { AppError } from '@shared/helpers/SharedErrorHelper'
import type { TUseImportNep6Account, TUseImportNep6DecryptedAccount } from '@shared/types/hooks'
import type { TModalState } from '@shared/types/modal'

type TActionsData = {
  decryptedAccounts: TUseImportNep6DecryptedAccount[]
}

const Nep6BackupImportStep4Modal = () => {
  const { t } = useTranslation('modals', { keyPrefix: 'nep6BackupImport' })
  const { accounts, onDecrypt } = useModalState<TModalState<'nep6-backup-import-step-4'>>()
  const { modalNavigate, modalErase } = useModalNavigate()
  const { handleGenerateData, handleTryDecryptAccount, handleImportBackupData } = useNep6BackupFile()

  const { actionData, actionState, setData, handleAct } = useActions<TActionsData>({
    decryptedAccounts: [],
  })

  const hasMultipleAccounts = accounts.length > 1
  const [samePassword, setSamePassword] = useState(hasMultipleAccounts)

  const isDisabled = accounts.some(
    account => !actionData.decryptedAccounts.some(({ address }) => address === account.address)
  )

  const handlePasswordSubmit = async (account: TUseImportNep6Account, password: string) => {
    const decryptedAccount = await handleTryDecryptAccount(account, password)

    if (!decryptedAccount) return

    setData(previousData => ({
      ...previousData,
      decryptedAccounts: [...previousData.decryptedAccounts, decryptedAccount],
    }))
  }

  const handleSamePasswordSubmit = async (password: string) => {
    try {
      const decryptedAccounts: TUseImportNep6DecryptedAccount[] = []

      for (const account of accounts) {
        const decryptedAccount = await handleTryDecryptAccount(account, password)

        if (!decryptedAccount) throw new AppError(t('step4.passwordError'))

        decryptedAccounts.push(decryptedAccount)
      }

      setData(previousData => ({ ...previousData, decryptedAccounts }))
    } catch (error) {
      setData(previousData => ({ ...previousData, decryptedAccounts: [] }))
      throw error
    }
  }

  const handleToggleSamePassword = (checked: boolean) => {
    setSamePassword(checked)
    setData(previousData => ({ ...previousData, decryptedAccounts: [] }))
  }

  const handleImport = async (data: TActionsData) => {
    const generatedData = handleGenerateData(data.decryptedAccounts)

    if (onDecrypt) {
      onDecrypt(generatedData)
      return
    }

    try {
      const { accounts } = await handleImportBackupData(generatedData)

      modalErase()
      modalNavigate('success', {
        state: {
          heading: t('title'),
          headingIcon: <TbPackageImport aria-hidden />,
          subtitle: t('step4.success.subtitle'),
          content: <ImportSuccessContent accounts={accounts} buttonLabel={t('step4.success.buttonLabel')} />,
        },
      })
    } catch (error) {
      LoggerHelper.error(error, { where: 'Nep6BackupImportStep4Modal', operation: 'importBackupData' })
      ToastHelper.error({ message: t('step4.importError') })
      modalErase()
    }
  }

  return (
    <ImportModalLayout heading={t('title')} size="md">
      <p>{t('step4.description')}</p>

      {hasMultipleAccounts && (
        <label className="mt-4 flex w-fit cursor-pointer items-center gap-2 text-xs text-gray-100">
          <Checkbox checked={samePassword} onCheckedChange={handleToggleSamePassword} />
          {t('step4.samePasswordLabel')}
        </label>
      )}

      <div className="mt-1 mb-3 flex min-h-0 w-full grow flex-col overflow-y-auto pr-2">
        {samePassword ? (
          <ImportSharedPassword
            inputLabel={t('step4.inputLabel')}
            inputPlaceholder={t('step4.inputPlaceholder')}
            error={t('step4.passwordError')}
            onSubmit={handleSamePasswordSubmit}
          />
        ) : (
          accounts.map((account, index) => (
            <Fragment key={account.address}>
              <ImportPasswordRow
                account={account}
                inputLabel={t('step4.inputLabel')}
                inputPlaceholder={t('step4.inputPlaceholder')}
                error={t('step4.passwordError')}
                onSubmit={handlePasswordSubmit}
              />

              {index < accounts.length - 1 && <Separator />}
            </Fragment>
          ))
        )}
      </div>

      <Button
        label={t('step4.buttonLabel')}
        flat
        className="px-16"
        onClick={handleAct(handleImport)}
        loading={actionState.isActing}
        disabled={isDisabled}
      />
    </ImportModalLayout>
  )
}

export default Nep6BackupImportStep4Modal
