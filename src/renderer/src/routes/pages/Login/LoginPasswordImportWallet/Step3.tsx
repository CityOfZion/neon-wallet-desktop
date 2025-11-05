import { Fragment, useEffect } from 'react'

import { useTranslation } from 'react-i18next'
import { Location, useLocation, useNavigate } from 'react-router'

import { Banner } from '@renderer/components/Banner'
import { Button } from '@renderer/components/Button'
import { Textarea } from '@renderer/components/Textarea'

import { UtilsHelper } from '@renderer/helpers/UtilsHelper'

import { TUseBackupOrMigrateActionsData, useBackupOrMigrate } from '@renderer/hooks/useBackupOrMigrate'
import { useImportAction } from '@renderer/hooks/useImportAction'
import { useModalNavigate } from '@renderer/hooks/useModalRouter'
import { TUseNeonBackupGeneratedData } from '@renderer/hooks/useNeonBackup'
import { TUseNeonMigrateGeneratedData } from '@renderer/hooks/useNeonMigrate'
import { useLastIndexesByWallet } from '@renderer/hooks/useUtilitySelector'

import TbFileImport from '@renderer/assets/images/tb-file-import.svg?react'

import { bsAggregator } from '@renderer/libs/blockchain-service'
import { TAccountsToImport, TBlockchainServiceKey, TWalletToCreate } from '@shared/types/blockchain'

type TLocationState = {
  password: string
  isMigration?: boolean
}

const LoginPasswordImportWalletStep3Page = () => {
  const { t } = useTranslation('pages', { keyPrefix: 'welcome.importWallet.step3' })
  const { t: commonT } = useTranslation('common')
  const navigate = useNavigate()
  const { state } = useLocation() as Location<TLocationState>
  const { modalErase, modalNavigate } = useModalNavigate()
  const { lastIndexesByWalletRef } = useLastIndexesByWallet()

  const submitAddress = async (address: string) => {
    const wallet: TWalletToCreate = {
      name: commonT('wallet.watchAccount'),
    }
    const serviceNames = bsAggregator.getBlockchainNameByAddress(address)
    const accounts: TAccountsToImport = serviceNames.map(serviceName => ({
      address: address,
      blockchain: serviceName,
      type: 'watch',
    }))

    navigate('/login-import-wallet-setup/4', {
      state: { wallets: [{ ...wallet, accounts }], password: state.password },
    })
  }

  const submitKey = async (key: string) => {
    const accounts: TAccountsToImport = []

    await UtilsHelper.promiseAll(Object.values(bsAggregator.blockchainServicesByName), async service => {
      const account = service.generateAccountFromKey(key)
      accounts.push({ address: account.address, blockchain: service.name, key, type: 'standard' })
    })

    const wallet: TWalletToCreate = {
      name: commonT('wallet.encryptedName'),
    }

    navigate('/login-import-wallet-setup/4', {
      state: { wallets: [{ ...wallet, accounts }], password: state.password },
    })
  }

  const submitMnemonic = async (mnemonic: string) => {
    const mnemonicAccounts = await bsAggregator.generateAccountsFromMnemonic(mnemonic, lastIndexesByWalletRef.current)

    const accounts = Array.from(mnemonicAccounts.entries())
      .map<TAccountsToImport>(([blockchain, accounts]) => {
        return accounts.map(account => ({
          address: account.address,
          blockchain,
          key: account.key,
          type: 'standard',
        }))
      })
      .flat()

    const wallet: TWalletToCreate = {
      name: commonT('wallet.mnemonicWalletName'),
      mnemonic,
    }

    navigate('/login-import-wallet-setup/4', {
      state: { wallets: [{ ...wallet, accounts }], password: state.password },
    })
  }

  const submitEncryptedKey = async (input: string) => {
    const handleDecrypt = async (key: string, address: string, blockchain: TBlockchainServiceKey) => {
      modalNavigate(-2)

      const wallet: TWalletToCreate = { name: commonT('wallet.encryptedName') }
      const accounts: TAccountsToImport = [{ address, blockchain, key, type: 'standard' }]

      navigate('/login-import-wallet-setup/4', {
        state: { wallets: [{ ...wallet, accounts }], password: state.password },
      })
    }

    const handleSelect = async (blockchain: TBlockchainServiceKey) => {
      modalNavigate('decrypt-key', {
        state: {
          encryptedKey: input,
          blockchain,
          onDecrypt: (key: string, address: string) => handleDecrypt(key, address, blockchain),
        },
      })
    }

    modalNavigate('blockchain-selection', {
      state: {
        heading: t('importEncryptedTitle'),
        headingIcon: <TbFileImport aria-hidden />,
        description: t('importEncryptedDescription'),
        subtitle: t('importEncryptedSubtitle'),
        withBackButton: false,
        onSelect: handleSelect,
      },
    })
  }

  const handleFileSubmit = async (data: TUseBackupOrMigrateActionsData) => {
    if (!data.content || !data.path || !data.type) return

    if (data.type === 'migrate') {
      modalNavigate('migrate-accounts-step-3', {
        state: {
          content: data.content,
          onDecrypt: ({ accountsToCreate, contactsToCreate, walletToCreate }: TUseNeonMigrateGeneratedData) => {
            modalErase('side')
            navigate('/login-import-wallet-setup/4', {
              state: {
                wallets: [{ ...walletToCreate, accounts: accountsToCreate }],
                password: state.password,
                contacts: contactsToCreate,
              },
            })
          },
        },
      })
      return
    }

    modalNavigate('confirm-password-recover', {
      state: {
        data,
        onDecrypt: (data: TUseNeonBackupGeneratedData) => {
          modalErase('side')
          navigate('/login-import-wallet-setup/4', { state: { ...data, password: state.password } })
        },
      },
    })
  }

  const importActions = useImportAction({
    encrypted: submitEncryptedKey,
    key: submitKey,
    mnemonic: submitMnemonic,
    address: submitAddress,
  })

  const fileActions = useBackupOrMigrate()

  useEffect(() => {
    if (!importActions.actionData.text) {
      return
    }

    fileActions.reset()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [importActions.actionData.text])

  useEffect(() => {
    if (!fileActions.actionData?.path) {
      return
    }

    importActions.reset()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fileActions.actionData.path])

  return (
    <Fragment>
      <p className="mt-10 text-center text-sm text-white">
        {!state.isMigration ? t('formTitle') : t('migrationFormTitle')}
      </p>
      <form
        className="mt-6 flex w-full grow flex-col items-center"
        onSubmit={
          state?.isMigration
            ? fileActions.handleAct(handleFileSubmit)
            : importActions.actionData.text
              ? importActions.handleAct(importActions.handleSubmit)
              : fileActions.handleAct(handleFileSubmit)
        }
      >
        {!state.isMigration && (
          <Textarea
            placeholder={t('inputPlaceholder')}
            containerClassName="mb-2.5"
            value={importActions.actionData.text}
            onChange={importActions.handleChange}
            pastable
            clearable
            multiline={importActions.actionData.inputType === 'mnemonic'}
            errorMessage={importActions.actionState.errors.text}
          />
        )}

        <Button
          label={t('locateFileButtonLabel')}
          type="button"
          className="w-64"
          variant="outlined"
          clickableProps={{
            className: 'px-5',
          }}
          onClick={fileActions.handleBrowse}
        />

        {state.isMigration && !fileActions.actionData.path && !fileActions.actionState.errors.path && (
          <Banner type="warning" message={t('neon2Warning')} className="mt-9" />
        )}

        {state.isMigration && fileActions.actionState.errors.path && (
          <Banner type="warning" message={t('importError')} className="mt-10" />
        )}

        {state.isMigration && fileActions.actionData.path && !fileActions.actionState.errors.path && (
          <Banner type="success" message={t('importSuccess')} className="mt-10" />
        )}

        <Button
          label={commonT('general.next')}
          className="mt-auto w-64"
          type="submit"
          disabled={importActions.actionData.text ? !importActions.actionState.isValid : !fileActions.actionData.path}
          loading={importActions.actionState.isActing || fileActions.actionState.isActing}
        />
      </form>
    </Fragment>
  )
}

export default LoginPasswordImportWalletStep3Page
