import { Fragment } from 'react'

import { useTranslation } from 'react-i18next'

import { Button } from '@renderer/components/Button'
import { Separator } from '@renderer/components/Separator'

import { ToastHelper } from '@renderer/helpers/ToastHelper'

import { useActions } from '@renderer/hooks/useActions'
import { useModalNavigate, useModalState } from '@renderer/hooks/useModalRouter'
import { useNeonImportMigrate } from '@renderer/hooks/useNeonMigrate'

import { MigrateAccountsModalLayout } from '@renderer/layouts/MigrateAccountsModalLayout'

import MdLooks4 from '@renderer/assets/images/md-looks-4.svg?react'
import TbPackageImport from '@renderer/assets/images/tb-package-import.svg?react'

import { AppError } from '@shared/helpers/SharedErrorHelper'
import type { TUseNeonMigrateAccountsSchema, TUseNeonMigrateDecryptedAccountSchema } from '@shared/types/hooks'
import type { TModalState } from '@shared/types/modal'

import { MigrateAccountsStep4Password } from './MigrateAccountsStep4Password'
import { SuccessContent } from './SuccessContent'

type TActionData = {
  decryptedAccounts: TUseNeonMigrateDecryptedAccountSchema[]
}

const MigrateAccountsStep4Modal = () => {
  const { t } = useTranslation('modals', { keyPrefix: 'migrateWallets' })
  const { selectedAccountsToMigrate, content, onDecrypt } = useModalState<TModalState<'migrate-accounts-step-4'>>()
  const { modalNavigate, modalErase } = useModalNavigate()
  const { handleTryDecryptAccount, handleGenerateData, handleImportBackupData } = useNeonImportMigrate()

  const { actionData, actionState, setData, handleAct } = useActions<TActionData>({
    decryptedAccounts: [],
  })

  const handlePasswordSubmit = async (accountToMigrate: TUseNeonMigrateAccountsSchema, password: string) => {
    const decryptedAccount = await handleTryDecryptAccount(accountToMigrate, password)

    if (!decryptedAccount) return

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

      modalErase()
      modalNavigate('success', {
        state: {
          heading: t('title'),
          headingIcon: <TbPackageImport />,
          subtitle: t('step4.success.subtitle'),
          content: <SuccessContent accounts={accounts} />,
        },
      })
    } catch (error) {
      console.error(error)
      ToastHelper.error({ message: AppError.wrap(error, t('step4.migrateError')).displayMessage })
      modalErase()
    }
  }

  return (
    <MigrateAccountsModalLayout
      currentStep={4}
      stepIcon={<MdLooks4 aria-hidden />}
      stepTitle={t('title')}
      withBackButton
    >
      <p>{t('step4.description')}</p>

      <div className="mt-1 mb-3 flex min-h-0 w-full grow flex-col overflow-y-auto pr-2">
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

export default MigrateAccountsStep4Modal
