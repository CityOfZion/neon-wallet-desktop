import { ChangeEvent, Fragment } from 'react'

import { BSKeychainHelper } from '@cityofzion/blockchain-service'
import { useTranslation } from 'react-i18next'
import { Location, useLocation, useNavigate } from 'react-router'

import { Button } from '@renderer/components/Button'
import { Input } from '@renderer/components/Input'

import { BlockchainServiceHelper } from '@renderer/helpers/BlockchainServiceHelper'
import { TestHelper } from '@renderer/helpers/TestHelper'

import { useCreateStandardAccount } from '@renderer/hooks/useAccountActions'
import { useActions } from '@renderer/hooks/useActions'
import { useExportMnemonic } from '@renderer/hooks/useExportMnemonic'
import { useSignup } from '@renderer/hooks/useLogin'
import { useCreateWallet } from '@renderer/hooks/useWalletActions'

type TFormData = {
  confirmPassword: string
  selectedFilePath?: string
}

type TLocationState = {
  password: string
}

type TProps = {
  onSubmit?: (password: string) => void
}

export const LoginPasswordSecuritySetupStep2Content = ({ onSubmit }: TProps) => {
  const { state } = useLocation() as Location<TLocationState>
  const { t } = useTranslation('pages', { keyPrefix: 'welcome.securitySetup.confirmPasswordStep' })
  const { t: commonT } = useTranslation('common')
  const navigate = useNavigate()
  const { createStandardAccount } = useCreateStandardAccount()
  const { createWallet } = useCreateWallet()
  const { signup } = useSignup()
  const { saveMnemonicToTextFile } = useExportMnemonic()

  const { actionData, actionState, handleAct, setData, setError } = useActions<TFormData>({
    confirmPassword: '',
    selectedFilePath: '',
  })

  const isNewWallet = !onSubmit
  const isDisabled =
    !actionData.confirmPassword || !!actionState.errors.confirmPassword || (isNewWallet && !actionData.selectedFilePath)

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const confirmPassword = event.target.value
    setData({ confirmPassword })

    if (confirmPassword !== state.password) {
      setError('confirmPassword', t('confirmPasswordError'))
    }
  }

  const handlePathSelectionButton = async () => {
    const result = await window.api.sendAsync('window:openDialog', {
      properties: ['openDirectory', 'createDirectory'],
    })

    setData({ selectedFilePath: result[0] })
  }

  const handleSubmit = async (data: TFormData) => {
    if (onSubmit) {
      onSubmit(state.password)
      return
    }

    await signup(data.confirmPassword)

    const mnemonic = BSKeychainHelper.generateMnemonic()

    if (isNewWallet && actionData.selectedFilePath) {
      await saveMnemonicToTextFile(mnemonic, actionData.selectedFilePath)
    }

    const wallet = createWallet({
      name: commonT('wallet.firstWalletName'),
      mnemonic,
    })

    const promises = BlockchainServiceHelper.blockchainNames.map(blockchain =>
      createStandardAccount({
        wallet,
        blockchain,
        name: commonT('account.defaultName', { accountNumber: 1 }),
      })
    )

    await Promise.allSettled(promises)

    navigate('/login-security-setup/3', { state: { selectedFilePath: actionData.selectedFilePath } })
  }

  return (
    <Fragment>
      <p className="mt-15 text-sm text-white">{isNewWallet ? t('formTitleNewWallet') : t('formTitleImportWallet')}</p>

      <form className="mt-6 flex w-full grow flex-col items-center gap-y-4" onSubmit={handleAct(handleSubmit)}>
        <Input
          testId="security-setup-second-password"
          type="password"
          value={actionData.confirmPassword}
          onChange={handleChange}
          placeholder={t('confirmPasswordPlaceholder')}
          errorMessage={actionState.errors.confirmPassword}
          autoFocus
        />

        {isNewWallet && (
          <div className="flex w-full gap-2.5">
            <Input
              value={actionData.selectedFilePath}
              containerClassName="w-full"
              placeholder={t('selectedFilePathPlaceholder')}
              aria-label={t('selectedFilePathLabel')}
              readOnly
            />

            <Button
              label={t('browseButtonLabel')}
              onClick={handlePathSelectionButton}
              className="w-36"
              type="button"
              {...TestHelper.buildTestObject('security-setup-browse-button')}
            />
          </div>
        )}

        <Button
          label={commonT('general.continue')}
          className="mt-auto w-64"
          type="submit"
          loading={actionState.isActing}
          disabled={isDisabled}
          {...TestHelper.buildTestObject('security-setup-second-submit')}
        />
      </form>
    </Fragment>
  )
}
