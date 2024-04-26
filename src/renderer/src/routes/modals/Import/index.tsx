import { useTranslation } from 'react-i18next'
import { MdChevronRight } from 'react-icons/md'
import { TbFileImport } from 'react-icons/tb'
import { useNavigate } from 'react-router-dom'
import { TBlockchainServiceKey } from '@renderer/@types/blockchain'
import { Banner } from '@renderer/components/Banner'
import { Button } from '@renderer/components/Button'
import { Textarea } from '@renderer/components/Textarea'
import { ToastHelper } from '@renderer/helpers/ToastHelper'
import { useAccountUtils } from '@renderer/hooks/useAccountSelector'
import { useBlockchainActions } from '@renderer/hooks/useBlockchainActions'
import { useImportAction } from '@renderer/hooks/useImportAction'
import { useModalNavigate } from '@renderer/hooks/useModalRouter'
import { useWalletsUtils } from '@renderer/hooks/useWalletSelector'
import { EndModalLayout } from '@renderer/layouts/EndModal'

export const ImportModal = () => {
  const { modalNavigate } = useModalNavigate()
  const { t } = useTranslation('modals', { keyPrefix: 'import' })
  const { t: tCommon } = useTranslation('common', { keyPrefix: 'wallet' })
  const { doesAccountExist } = useAccountUtils()
  const { createWallet, importAccount } = useBlockchainActions()
  const navigate = useNavigate()
  const { doesMnemonicExist } = useWalletsUtils()

  const submitKey = async (key: string) => {
    modalNavigate('import-key-accounts-selection', { state: { key } })
  }

  const submitMnemonic = async (mnemonic: string) => {
    if (await doesMnemonicExist(mnemonic)) {
      throw new Error(t('errors.mnemonicAlreadyExist'))
    }

    modalNavigate('import-mnemonic-accounts-selection', { state: { mnemonic } })
  }

  const submitEncrypted = async (encryptedKey: string) => {
    modalNavigate('blockchain-selection', {
      state: {
        heading: t('title'),
        headingIcon: <TbFileImport />,
        description: t('importEncryptedDescription'),
        onSelect: (blockchain: TBlockchainServiceKey) => {
          modalNavigate('decrypt-key', {
            state: {
              encryptedKey,
              blockchain,
              onDecrypt: async (key: string, address: string) => {
                if (doesAccountExist(address)) {
                  throw new Error(t('addressAlreadyExist'))
                }

                const wallet = await createWallet({
                  name: tCommon('encryptedName'),
                  walletType: 'legacy',
                })
                await importAccount({ address, blockchain, wallet, key, type: 'legacy' })

                ToastHelper.success({ message: t('successEncryptKey') })
                modalNavigate(-3)
                navigate(`/app/wallets/${address}/overview`)
              },
            },
          })
        },
      },
    })
  }

  const submitAddress = async (address: string) => {
    if (doesAccountExist(address)) {
      throw new Error(t('addressAlreadyExist'))
    }

    modalNavigate('add-watch', { replace: true, state: { address } })
  }

  const { actionData, actionState, handleAct, handleChange, handleSubmit } = useImportAction({
    key: submitKey,
    mnemonic: submitMnemonic,
    encrypted: submitEncrypted,
    address: submitAddress,
  })

  return (
    <EndModalLayout heading={t('title')} headingIcon={<TbFileImport />} contentClassName="flex flex-col">
      <p className="text-gray-300 uppercase font-bold">{t('subtitle')}</p>
      <p className="text-xs">{t('description')}</p>

      <form className="mt-10 flex flex-col justify-between flex-grow" onSubmit={handleAct(handleSubmit)}>
        <div>
          <Textarea
            placeholder={t('inputPlaceholder')}
            error={!!actionState.errors.text}
            value={actionData.text}
            onChange={handleChange}
            compacted
            clearable
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
          rightIcon={<MdChevronRight />}
          loading={actionState.isActing}
          flat
        />
      </form>
    </EndModalLayout>
  )
}
