import { ChangeEvent, Fragment } from 'react'

import { BSKeychainHelper } from '@cityofzion/blockchain-service'
import { useTranslation } from 'react-i18next'
import { Location, useLocation, useNavigate } from 'react-router'

import { Button } from '@renderer/components/Button'
import { Input } from '@renderer/components/Input'

import { BlockchainServiceHelper } from '@renderer/helpers/BlockchainServiceHelper'
import { TestHelper } from '@renderer/helpers/TestHelper'

import { useActions } from '@renderer/hooks/useActions'
import { useBlockchainActions } from '@renderer/hooks/useBlockchainActions'
import { useSignup } from '@renderer/hooks/useLogin'

type TFormData = {
  confirmPassword: string
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
  const { createWallet, createStandardAccount } = useBlockchainActions()
  const { signup } = useSignup()

  const { actionData, actionState, handleAct, setData, setError } = useActions<TFormData>({
    confirmPassword: '',
  })

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const confirmPassword = event.target.value
    setData({ confirmPassword })

    if (confirmPassword !== state.password) {
      setError('confirmPassword', t('confirmPasswordError'))
    }
  }

  const handleSubmit = async (data: TFormData) => {
    if (onSubmit) {
      onSubmit(state.password)
      return
    }

    await signup(data.confirmPassword)

    const mnemonic = BSKeychainHelper.generateMnemonic()

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

    navigate('/login-security-setup/3')
  }

  return (
    <Fragment>
      <p className="mt-15 text-sm text-white">{t('formTitle')}</p>
      <form className="mt-6 flex w-full grow flex-col items-center justify-between" onSubmit={handleAct(handleSubmit)}>
        <Input
          testId="security-setup-second-password"
          type="password"
          value={actionData.confirmPassword}
          onChange={handleChange}
          placeholder={t('confirmPasswordPlaceholder')}
          errorMessage={actionState.errors.confirmPassword}
          autoFocus
        />

        <Button
          label={commonT('general.continue')}
          className="w-64"
          type="submit"
          loading={actionState.isActing}
          disabled={!actionState.isValid}
          {...TestHelper.buildTestObject('security-setup-second-submit')}
        />
      </form>
    </Fragment>
  )
}
