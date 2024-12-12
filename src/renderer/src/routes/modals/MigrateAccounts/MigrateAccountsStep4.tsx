import { Fragment } from 'react'
import { useTranslation } from 'react-i18next'
import { MdLooks4 } from 'react-icons/md'
import { TbPackageImport } from 'react-icons/tb'
import { Button } from '@renderer/components/Button'
import { Separator } from '@renderer/components/Separator'
import { ToastHelper } from '@renderer/helpers/ToastHelper'
import { useActions } from '@renderer/hooks/useActions'
import { useModalNavigate, useModalState } from '@renderer/hooks/useModalRouter'
import {
  TUseNeonMigrateAccountsSchema,
  TUseNeonMigrateDecryptedAccountSchema,
  TUseNeonMigrateGeneratedData,
  TUseNeonMigrateSchema,
  useNeonImportMigrate,
} from '@renderer/hooks/useNeonMigrate'
import { MigrateAccountsModalLayout } from '@renderer/layouts/MigrateAccountsModalLayout'

import { MigrateAccountsStep4Password } from './MigrateAccountsStep4Password'
import { SuccessContent } from './SuccessContent'

type TState = {
  selectedAccountsToMigrate: TUseNeonMigrateAccountsSchema[]
  content: TUseNeonMigrateSchema
  onDecrypt?: (generatedData: TUseNeonMigrateGeneratedData) => void
}

type TActionData = {
  decryptedAccounts: TUseNeonMigrateDecryptedAccountSchema[]
}

export const MigrateAccountsStep4Modal = () => {
  const { t } = useTranslation('modals', { keyPrefix: 'migrateWallets' })
  const { selectedAccountsToMigrate, content, onDecrypt } = useModalState<TState>()
  const { modalNavigate } = useModalNavigate()
  const { handleTryDecryptAccount, handleGenerateData, handleImportBackupData } = useNeonImportMigrate()

  const { actionData, actionState, setData, handleAct } = useActions<TActionData>({
    decryptedAccounts: [],
  })

  const handlePasswordSubmit = async (accountToMigrate: TUseNeonMigrateAccountsSchema, password: string) => {
    const decryptedAccount = await handleTryDecryptAccount(accountToMigrate, password)
    setData(prev => ({ ...prev, decryptedAccounts: [...prev.decryptedAccounts, decryptedAccount] }))
  }

  const handleMigrate = async (data: TActionData) => {
    const generatedData = handleGenerateData(content, data.decryptedAccounts)

    if (onDecrypt) {
      onDecrypt(generatedData)
      return
    }

    try {
      const { accounts } = await handleImportBackupData(generatedData)

      modalNavigate(-3)
      modalNavigate('success', {
        state: {
          heading: t('title'),
          headingIcon: <TbPackageImport />,
          subtitle: t('step4.success.subtitle'),
          content: <SuccessContent accounts={accounts} />,
        },
      })
    } catch (error) {
      ToastHelper.error({ message: t('step4.migrateError') })
      modalNavigate(-3)
    }
  }

  return (
    <MigrateAccountsModalLayout currentStep={4} stepIcon={<MdLooks4 />} stepTitle={t('title')} withBackButton>
      <p>{t('step4.description')}</p>

      <div className="w-full flex-grow flex flex-col overflow-y-auto min-h-0 mt-1 mb-3 pr-2">
        {selectedAccountsToMigrate.map((accountToMigrate, index) => (
          <Fragment key={accountToMigrate.address}>
            <MigrateAccountsStep4Password accountToMigrate={accountToMigrate} onSubmit={handlePasswordSubmit} />

            {index < selectedAccountsToMigrate.length - 1 && <Separator />}
          </Fragment>
        ))}
      </div>

      <Button
        label={t('step4.buttonLabel')}
        flat
        className="px-16"
        onClick={handleAct(handleMigrate)}
        loading={actionState.isActing}
        disabled={selectedAccountsToMigrate.some(
          wallet => !actionData.decryptedAccounts.some(decryptedWallet => decryptedWallet.address === wallet.address)
        )}
      />
    </MigrateAccountsModalLayout>
  )
}
