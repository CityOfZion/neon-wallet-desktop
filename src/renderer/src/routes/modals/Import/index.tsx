import { useEffect } from 'react'

import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'

import { Banner } from '@renderer/components/Banner'
import { Button } from '@renderer/components/Button'
import { Textarea } from '@renderer/components/Textarea'

import { ToastHelper } from '@renderer/helpers/ToastHelper'

import { useImportAccount } from '@renderer/hooks/useAccountActions'
import { useAccountUtils } from '@renderer/hooks/useAccountSelector'
import { useImportAction } from '@renderer/hooks/useImportAction'
import { useModalNavigate, useModalState } from '@renderer/hooks/useModalRouter'
import { useCreateWallet } from '@renderer/hooks/useWalletActions'

import { SideModalLayout } from '@renderer/layouts/SideModal'

import TbFileImport from '@renderer/assets/images/tb-file-import.svg?react'

import { AppError } from '@shared/helpers/SharedErrorHelper'
import { SharedUtilsHelper } from '@shared/helpers/SharedUtilsHelper'
import { TBlockchainServiceKey } from '@shared/types/blockchain'
import type { TModalState } from '@shared/types/modal'

const ImportModal = () => {
  const { modalNavigate } = useModalNavigate()
  const modalState = useModalState<TModalState<'import'>>()
  const { t } = useTranslation('modals', { keyPrefix: 'import' })
  const { t: tCommon } = useTranslation('common', { keyPrefix: 'wallet' })
  const { doesAccountExist } = useAccountUtils()
  const { importAccount } = useImportAccount()
  const { createWallet } = useCreateWallet()
  const navigate = useNavigate()

  const modalStateText = modalState?.text

  const submitKey = async (key: string) => {
    modalNavigate('import-accounts-selection', { state: { mnemonicOrKey: key } })
  }

  const submitMnemonic = async (mnemonic: string) => {
    modalNavigate('import-accounts-selection', { state: { mnemonicOrKey: mnemonic } })
  }

  const submitEncrypted = async (encryptedKey: string) => {
    modalNavigate('blockchain-selection', {
      state: {
        heading: t('title'),
        headingIcon: <TbFileImport aria-hidden />,
        description: t('importEncryptedDescription'),
        onSelect: (blockchain: TBlockchainServiceKey) => {
          modalNavigate('decrypt-key', {
            state: {
              encryptedKey,
              blockchain,
              onDecrypt: async (key: string, address: string) => {
                if (doesAccountExist({ address, blockchain })) {
                  throw new AppError(t('addressAlreadyExist'))
                }

                const wallet = createWallet({ name: tCommon('encryptedName') })
                const account = await importAccount({ address, blockchain, wallet, key, type: 'standard' })

                ToastHelper.success({ message: t('successEncryptKey') })
                modalNavigate(-3)
                navigate('/wallets/overview', { state: { account } })
              },
            },
          })
        },
      },
    })
  }

  const submitAddress = async (address: string) => {
    modalNavigate('import-watch-accounts', { state: { address } })
  }

  const { actionData, actionDataRef, actionState, handleAct, handleChange, handleSubmit } = useImportAction({
    key: submitKey,
    mnemonic: submitMnemonic,
    encrypted: submitEncrypted,
    address: submitAddress,
  })

  useEffect(() => {
    async function handle() {
      if (!modalStateText) return

      handleChange(modalStateText)

      await SharedUtilsHelper.sleep(500)

      handleSubmit(actionDataRef.current)
    }

    handle()

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modalStateText])

  return (
    <SideModalLayout heading={t('title')} headingIcon={<TbFileImport aria-hidden />} contentClassName="flex flex-col">
      <p className="text-xs">{t('description')}</p>

      <form className="mt-10 flex grow flex-col justify-between" onSubmit={handleAct(handleSubmit)}>
        <div>
          <Textarea
            placeholder={t('inputPlaceholder')}
            error={!!actionState.errors.text}
            value={actionData.text}
            onChange={handleChange}
            compacted
            clearable
            pastable
            multiline={actionData.inputType === 'mnemonic'}
          />

          <div className="mt-5">
            {actionState.errors.text ? (
              <Banner type="error" message={actionState.errors.text} />
            ) : (
              actionState.isValid &&
              actionData.inputType && <Banner type="success" message={t(`success.${actionData.inputType}` as const)} />
            )}
          </div>
        </div>

        <Button
          className="mt-8"
          type="submit"
          label={t('buttonContinueLabel')}
          disabled={!actionData.text || !actionState.isValid}
          loading={actionState.isActing}
          flat
        />
      </form>
    </SideModalLayout>
  )
}

export default ImportModal
