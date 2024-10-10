import { ChangeEvent, Fragment } from 'react'
import { useTranslation } from 'react-i18next'
import { Location, useLocation, useNavigate } from 'react-router-dom'
import { generateMnemonic } from '@cityofzion/bs-asteroid-sdk'
import { Button } from '@renderer/components/Button'
import { Input } from '@renderer/components/Input'
import { TestHelper } from '@renderer/helpers/TestHelper'
import { useActions } from '@renderer/hooks/useActions'
import { useBlockchainActions } from '@renderer/hooks/useBlockchainActions'
import { useSettingsActions } from '@renderer/hooks/useSettingsSelector'

type TFormData = {
  confirmPassword: string
}

type TLocationState = {
  password: string
}

type TProps = {
  onSubmit?: (password: string) => void
}

export const WelcomeSecuritySetupStep2Page = ({ onSubmit }: TProps) => {
  const { state } = useLocation() as Location<TLocationState>
  const { t } = useTranslation('pages', { keyPrefix: 'welcome.securitySetup.step2' })
  const { t: commonT } = useTranslation('common')
  const navigate = useNavigate()
  const { createWallet, createStandardAccount } = useBlockchainActions()
  const { setHasPassword } = useSettingsActions()

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

    await setHasPassword(data.confirmPassword)

    const words = generateMnemonic()

    const wallet = createWallet({
      name: commonT('wallet.firstWalletName'),
      mnemonic: words.join(' '),
    })

    await createStandardAccount({
      wallet,
      blockchain: 'neo3',
      name: commonT('account.defaultName', { accountNumber: 1 }),
    })

    navigate('/welcome-security-setup/3')
  }

  return (
    <Fragment>
      <p className="text-sm text-white mt-15">{t('formTitle')}</p>
      <form
        className="w-full flex-grow flex flex-col justify-between mt-6 items-center"
        onSubmit={handleAct(handleSubmit)}
      >
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
          disabled={!actionState.isValid || actionState.isActing}
          {...TestHelper.buildTestObject('security-setup-second-submit')}
        />
      </form>
    </Fragment>
  )
}
