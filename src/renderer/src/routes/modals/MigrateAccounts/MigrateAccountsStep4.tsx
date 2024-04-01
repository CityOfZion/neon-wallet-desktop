import { Fragment } from 'react'
import { useTranslation } from 'react-i18next'
import { MdLooks4 } from 'react-icons/md'
import { TbPackageImport } from 'react-icons/tb'
import { Button } from '@renderer/components/Button'
import { Separator } from '@renderer/components/Separator'
import { ToastHelper } from '@renderer/helpers/ToastHelper'
import { useActions } from '@renderer/hooks/useActions'
import { TMigrateAccountSchema } from '@renderer/hooks/useBackupOrMigrate'
import { useBlockchainActions } from '@renderer/hooks/useBlockchainActions'
import { useModalNavigate, useModalState } from '@renderer/hooks/useModalRouter'
import { MigrateAccountsModalLayout } from '@renderer/layouts/MigrateAccountsModalLayout'

import { DecryptAccountPasswordContainer, TMigrateDecryptedAccountSchema } from './DecryptAccountPasswordContainer'
import { SuccessContent } from './SuccessContent'

type TState = {
  selectedAccountsToMigrate: TMigrateAccountSchema[]
}

type TActionData = {
  decryptedAccounts: TMigrateDecryptedAccountSchema[]
}

export const MigrateAccountsStep4Modal = () => {
  const { t } = useTranslation('modals', { keyPrefix: 'migrateWallets' })
  const { t: commonT } = useTranslation('common', { keyPrefix: 'wallet' })
  const { selectedAccountsToMigrate } = useModalState<TState>()
  const { createWallet, importAccounts } = useBlockchainActions()
  const { modalNavigate } = useModalNavigate()

  const { actionData, actionState, setData, handleAct } = useActions<TActionData>({
    decryptedAccounts: [],
  })

  const handleDecrypt = (decryptedWallet: TMigrateDecryptedAccountSchema) => {
    setData(prev => ({ ...prev, decryptedAccounts: [...prev.decryptedAccounts, decryptedWallet] }))
  }

  const handleMigrate = async (data: TActionData) => {
    try {
      const wallet = await createWallet({
        walletType: 'legacy',
        name: commonT('migratedWalletName'),
      })

      const accounts = await importAccounts({
        wallet,
        accounts: data.decryptedAccounts.map(decryptedWallet => ({
          address: decryptedWallet.address,
          blockchain: decryptedWallet.blockchain,
          key: decryptedWallet.decryptedKey,
          type: 'legacy',
          name: decryptedWallet.label,
        })),
      })

      modalNavigate(-3)
      modalNavigate('success', {
        state: {
          heading: t('title'),
          headingIcon: <TbPackageImport />,
          subtitle: t('step4.success.subtitle'),
          content: <SuccessContent wallet={wallet} accounts={accounts} />,
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
            <DecryptAccountPasswordContainer accountToMigrate={accountToMigrate} onDecrypt={handleDecrypt} />

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
