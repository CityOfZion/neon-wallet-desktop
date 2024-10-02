import { Fragment } from 'react'
import { useTranslation } from 'react-i18next'
import { MdLooks4 } from 'react-icons/md'
import { TbPackageImport } from 'react-icons/tb'
import { Button } from '@renderer/components/Button'
import { Separator } from '@renderer/components/Separator'
import { ToastHelper } from '@renderer/helpers/ToastHelper'
import { UtilsHelper } from '@renderer/helpers/UtilsHelper'
import { useActions } from '@renderer/hooks/useActions'
import { TMigrateAccountsSchema, TMigrateSchema } from '@renderer/hooks/useBackupOrMigrate'
import { useBlockchainActions } from '@renderer/hooks/useBlockchainActions'
import { useContactsSelector } from '@renderer/hooks/useContactSelector'
import { useModalNavigate, useModalState } from '@renderer/hooks/useModalRouter'
import { MigrateAccountsModalLayout } from '@renderer/layouts/MigrateAccountsModalLayout'
import { TAccountsToImport, TWalletToCreate } from '@shared/@types/blockchain'
import { IContactState, TContactAddress } from '@shared/@types/store'

import { DecryptAccountPasswordContainer, TMigrateDecryptedAccountSchema } from './DecryptAccountPasswordContainer'
import { SuccessContent } from './SuccessContent'

type TState = {
  selectedAccountsToMigrate: TMigrateAccountsSchema[]
  content: TMigrateSchema
  onDecrypt?: (wallet: TWalletToCreate, accounts: TAccountsToImport, contacts: IContactState[]) => void
}

type TActionData = {
  decryptedAccounts: TMigrateDecryptedAccountSchema[]
}

export const MigrateAccountsStep4Modal = () => {
  const { t } = useTranslation('modals', { keyPrefix: 'migrateWallets' })
  const { t: commonT } = useTranslation('common', { keyPrefix: 'wallet' })
  const { selectedAccountsToMigrate, content, onDecrypt } = useModalState<TState>()
  const { createContacts, createWallet, importAccounts } = useBlockchainActions()
  const { contactsRef } = useContactsSelector()
  const { modalNavigate } = useModalNavigate()

  const { actionData, actionState, setData, handleAct } = useActions<TActionData>({
    decryptedAccounts: [],
  })

  const handleDecrypt = (decryptedWallet: TMigrateDecryptedAccountSchema) => {
    setData(prev => ({ ...prev, decryptedAccounts: [...prev.decryptedAccounts, decryptedWallet] }))
  }

  const handleMigrate = async (data: TActionData) => {
    const contactsToCreate: IContactState[] = []
    const walletToCreate: TWalletToCreate = { name: commonT('migratedWalletName') }
    const accountsToCreate: TAccountsToImport = []

    data.decryptedAccounts.map(({ address, blockchain, decryptedKey, label }) => {
      if (!blockchain) return

      accountsToCreate.push({ address, blockchain, key: decryptedKey, type: 'standard', name: label })
    })

    content.contacts.forEach(({ name, addresses }) => {
      const contactAddresses: TContactAddress[] = []
      const foundContact = contactsRef.current.find(contact => name === contact.name)

      addresses.forEach(({ address, blockchain }) => {
        if (!blockchain || foundContact?.addresses?.some(contact => contact.address === address)) return

        contactAddresses.push({ address, blockchain })
      })

      if (!contactAddresses.length) return

      contactsToCreate.push({ name, id: UtilsHelper.uuid(), addresses: contactAddresses })
    })

    if (onDecrypt) {
      onDecrypt(walletToCreate, accountsToCreate, contactsToCreate)
      return
    }

    try {
      createContacts(contactsToCreate)

      const wallet = createWallet(walletToCreate)
      const accounts = await importAccounts({ wallet, accounts: accountsToCreate })

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
