import { Fragment, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { TbFileImport } from 'react-icons/tb'
import { Location, useLocation, useNavigate } from 'react-router-dom'
import { Button } from '@renderer/components/Button'
import { Textarea } from '@renderer/components/Textarea'
import { UtilsHelper } from '@renderer/helpers/UtilsHelper'
import { TUseBackupOrMigrateActionsData, useBackupOrMigrate } from '@renderer/hooks/useBackupOrMigrate'
import { useImportAction } from '@renderer/hooks/useImportAction'
import { useModalNavigate } from '@renderer/hooks/useModalRouter'
import { bsAggregator } from '@renderer/libs/blockchainService'
import { TAccountsToImport, TBackupFormat, TBlockchainServiceKey, TWalletToCreate } from '@shared/@types/blockchain'
import { IContactState } from '@shared/@types/store'

type TLocationState = {
  password: string
  isMigration?: boolean
}

export const WelcomeImportWalletStep3Page = () => {
  const { t } = useTranslation('pages', { keyPrefix: 'welcome.importWallet.step3' })
  const { t: commonT } = useTranslation('common')
  const navigate = useNavigate()
  const { state } = useLocation() as Location<TLocationState>
  const { modalErase, modalNavigate } = useModalNavigate()

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

    navigate('/welcome-import-wallet/4', { state: { wallets: [{ ...wallet, accounts }], password: state.password } })
  }

  const submitKey = async (key: string) => {
    const accounts: TAccountsToImport = []

    await UtilsHelper.promiseAll(Object.values(bsAggregator.blockchainServicesByName), async service => {
      const account = service.generateAccountFromKey(key)
      accounts.push({ address: account.address, blockchain: service.blockchainName, key, type: 'standard' })
    })

    const wallet: TWalletToCreate = {
      name: commonT('wallet.encryptedName'),
    }

    navigate('/welcome-import-wallet/4', { state: { wallets: [{ ...wallet, accounts }], password: state.password } })
  }

  const submitMnemonic = async (mnemonic: string) => {
    const mnemonicAccounts = await bsAggregator.generateAccountFromMnemonicAllBlockchains(mnemonic)

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

    navigate('/welcome-import-wallet/4', { state: { wallets: [{ ...wallet, accounts }], password: state.password } })
  }

  const submitEncryptedKey = async (input: string) => {
    const handleDecrypt = async (key: string, address: string, blockchain: TBlockchainServiceKey) => {
      modalNavigate(-2)

      const wallet: TWalletToCreate = {
        name: commonT('wallet.encryptedName'),
      }

      const accounts: TAccountsToImport = [{ address, blockchain, key, type: 'standard' }]

      navigate('/welcome-import-wallet/4', { state: { wallets: [{ ...wallet, accounts }], password: state.password } })
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
        headingIcon: <TbFileImport />,
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
          onDecrypt: (wallet: TWalletToCreate, accounts: TAccountsToImport, contacts: IContactState[]) => {
            modalErase('side')
            navigate('/welcome-import-wallet/4', {
              state: { wallets: [{ ...wallet, accounts }], password: state.password, contacts },
            })
          },
        },
      })
      return
    }

    modalNavigate('confirm-password-recover', {
      state: {
        content: data.content,
        onDecrypt: (data: TBackupFormat) => {
          modalErase('side')
          navigate('/welcome-import-wallet/4', { state: { ...data, password: state.password } })
        },
      },
      replace: true,
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
      <p className="text-sm text-white mt-10 text-center">
        {!state.isMigration ? t('formTitle') : t('migrationFormTitle')}
      </p>
      <form
        className="w-full flex-grow flex flex-col  mt-6 items-center"
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
          label="Locate file"
          type="button"
          className="w-64"
          variant="outlined"
          clickableProps={{
            className: 'px-5',
          }}
          onClick={fileActions.handleBrowse}
        />

        <Button
          label={commonT('general.next')}
          className="w-64 mt-auto"
          type="submit"
          disabled={importActions.actionData.text ? !importActions.actionState.isValid : !fileActions.actionData.path}
          loading={importActions.actionState.isActing || fileActions.actionState.isActing}
        />
      </form>
    </Fragment>
  )
}
