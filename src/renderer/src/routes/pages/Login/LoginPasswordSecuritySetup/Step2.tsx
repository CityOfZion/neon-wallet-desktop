import { ChangeEvent, Fragment } from 'react'

import { BSKeychainHelper } from '@cityofzion/blockchain-service'
import { useTranslation } from 'react-i18next'
import { Location, useLocation, useNavigate } from 'react-router'

import { Button } from '@renderer/components/Button'
import { Input } from '@renderer/components/Input'

import { AnalyticsHelper } from '@renderer/helpers/AnalyticsHelper'
import { TestHelper } from '@renderer/helpers/TestHelper'

import { useCreateStandardAccount } from '@renderer/hooks/useAccountActions'
import { useActions } from '@renderer/hooks/useActions'
import { useExportMnemonic } from '@renderer/hooks/useExportMnemonic'
import { useSignup } from '@renderer/hooks/useLogin'
import { useModalNavigate } from '@renderer/hooks/useModalRouter'
import { useAppDispatch } from '@renderer/hooks/useRedux'
import { useCreateWallet } from '@renderer/hooks/useWalletActions'
import { useWalletsSelector } from '@renderer/hooks/useWalletSelector'

import TbWallet from '@renderer/assets/images/tb-wallet.svg?react'

import { authReducerActions } from '@renderer/store/reducers/auth'
import { TBlockchainServiceKey } from '@shared/types/blockchain'

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
  const { modalNavigate, modalErase } = useModalNavigate()
  const { createStandardAccount } = useCreateStandardAccount()
  const { createWallet } = useCreateWallet()
  const { signup } = useSignup()
  const { saveMnemonicToTextFile } = useExportMnemonic()
  const { walletsRef } = useWalletsSelector()
  const dispatch = useAppDispatch()

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

    modalNavigate('blockchain-selection', {
      state: {
        heading: t('blockchainSelectionModalTitle'),
        headingIcon: <TbWallet aria-hidden />,
        description: t('blockchainSelectionModalDescription'),
        isMulti: true,
        onSelect: async (blockchains: TBlockchainServiceKey[]) => {
          await signup(data.confirmPassword)

          const mnemonic = BSKeychainHelper.generateMnemonic()

          const wallet = createWallet({
            name: commonT('wallet.firstWalletName'),
            mnemonic,
          })

          const promises = blockchains.map(blockchain =>
            createStandardAccount({
              wallet,
              blockchain,
              name: commonT('account.defaultName', { accountNumber: 1 }),
            })
          )

          await Promise.allSettled(promises)

          if (isNewWallet && actionData.selectedFilePath) {
            await saveMnemonicToTextFile(mnemonic, actionData.selectedFilePath)

            dispatch(authReducerActions.saveWallet({ ...walletsRef.current[0], backupStatus: 'successful' }))
          }

          AnalyticsHelper.logEvent('onboarding_completed')
          modalErase()
          navigate('/login-security-setup/3', { state: { selectedFilePath: actionData.selectedFilePath } })
        },
      },
    })
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
