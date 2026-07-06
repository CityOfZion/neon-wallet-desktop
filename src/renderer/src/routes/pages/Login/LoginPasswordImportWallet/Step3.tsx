import { Fragment, useEffect } from 'react'

import { useTranslation } from 'react-i18next'
import { Location, useLocation, useNavigate } from 'react-router'

import { Banner } from '@renderer/components/Banner'
import { Button } from '@renderer/components/Button'
import { Textarea } from '@renderer/components/Textarea'

import { BlockchainServiceHelper } from '@renderer/helpers/BlockchainServiceHelper'
import { TestHelper } from '@renderer/helpers/TestHelper'
import { UtilsHelper } from '@renderer/helpers/UtilsHelper'

import { useImportAction } from '@renderer/hooks/useImportAction'
import { TUseImportFromFileActionsData, useImportFromFile } from '@renderer/hooks/useImportFromFile'
import { useModalNavigate } from '@renderer/hooks/useModalRouter'
import { useLastIndexesByWallet } from '@renderer/hooks/useUtilitySelector'

import TbFileImport from '@renderer/assets/images/tb-file-import.svg?react'

import { TAccountsToImport, TBlockchainServiceKey, TUseCreateWalletParams } from '@shared/types/blockchain'
import type {
  TUseNeonBackupGeneratedData,
  TUseNeonMigrateGeneratedData,
  TUseNep6GeneratedData,
} from '@shared/types/hooks'

type TLocationState = {
  password: string
  isMigration?: boolean
}

export const LoginPasswordImportWalletStep3Content = () => {
  const { t } = useTranslation('pages', { keyPrefix: 'welcome.importWallet.keyStep' })
  const { t: tCommon } = useTranslation('common')
  const navigate = useNavigate()
  const { state } = useLocation() as Location<TLocationState>
  const { modalErase, modalNavigate } = useModalNavigate()
  const { lastIndexesByWalletRef } = useLastIndexesByWallet()

  const submitAddress = async (address: string) => {
    const wallet: TUseCreateWalletParams = {
      name: tCommon('wallet.watchAccount'),
    }
    const serviceNames = BlockchainServiceHelper.bsAggregator.getBlockchainNameByAddress(address)
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

    await UtilsHelper.promiseAll(
      Object.values(BlockchainServiceHelper.bsAggregator.blockchainServicesByName),
      async service => {
        const account = await service.generateAccountFromKey(key)
        accounts.push({ address: account.address, blockchain: service.name, key, type: 'standard' })
      }
    )

    const wallet: TUseCreateWalletParams = {
      name: tCommon('wallet.encryptedName'),
    }

    navigate('/login-import-wallet-setup/4', {
      state: { wallets: [{ ...wallet, accounts }], password: state.password },
    })
  }

  const submitMnemonic = async (mnemonic: string) => {
    const mnemonicAccounts = await BlockchainServiceHelper.bsAggregator.generateAccountsFromMnemonic(
      mnemonic,
      lastIndexesByWalletRef.current
    )

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

    const wallet: TUseCreateWalletParams = {
      name: tCommon('wallet.mnemonicWalletName'),
      mnemonic,
    }

    navigate('/login-import-wallet-setup/4', {
      state: { wallets: [{ ...wallet, accounts }], password: state.password },
    })
  }

  const submitEncryptedKey = async (input: string) => {
    const handleDecrypt = async (key: string, address: string, blockchain: TBlockchainServiceKey) => {
      modalNavigate(-2)

      const wallet: TUseCreateWalletParams = { name: tCommon('wallet.encryptedName') }
      const accounts: TAccountsToImport = [{ address, blockchain, key, type: 'standard' }]

      navigate('/login-import-wallet-setup/4', {
        state: { wallets: [{ ...wallet, accounts }], password: state.password },
      })
    }

    const handleSelect = async ([blockchain]: TBlockchainServiceKey[]) => {
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

  const handleFileSubmit = async (data: TUseImportFromFileActionsData) => {
    if (!data.content || !data.path || !data.type) return

    if (data.type === 'migrate') {
      const onDecrypt = ({ accountsToCreate, contactsToCreate, walletToCreate }: TUseNeonMigrateGeneratedData) => {
        modalErase()
        navigate('/login-import-wallet-setup/4', {
          state: {
            wallets: [{ ...walletToCreate, accounts: accountsToCreate }],
            password: state.password,
            contacts: contactsToCreate,
          },
        })
      }

      modalNavigate('neon-migrate-step-3', { state: { content: data.content, onDecrypt } })

      return
    }

    if (data.type === 'nep6') {
      const onDecrypt = ({ accountsToCreate, walletToCreate }: TUseNep6GeneratedData) => {
        modalErase()
        navigate('/login-import-wallet-setup/4', {
          state: {
            wallets: [{ ...walletToCreate, accounts: accountsToCreate }],
            password: state.password,
          },
        })
      }

      modalNavigate('nep6-backup-import-step-3', { state: { content: data.content, onDecrypt } })

      return
    }

    modalNavigate('confirm-password-recover', {
      state: {
        data,
        onDecrypt: (data: TUseNeonBackupGeneratedData) => {
          modalErase()
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

  const fileActions = useImportFromFile()

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
            {...TestHelper.buildTestObject('import-wallet-key-textarea')}
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
          label={tCommon('general.next')}
          className="mt-auto w-64"
          type="submit"
          disabled={importActions.actionData.text ? !importActions.actionState.isValid : !fileActions.actionData.path}
          loading={importActions.actionState.isActing || fileActions.actionState.isActing}
          {...TestHelper.buildTestObject('import-wallet-key-submit')}
        />
      </form>
    </Fragment>
  )
}
