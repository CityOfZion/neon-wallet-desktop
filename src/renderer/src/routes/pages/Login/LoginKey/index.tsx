import { Fragment } from 'react'

import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'

import { Button } from '@renderer/components/Button'
import { TemporaryLimitsBox } from '@renderer/components/TemporaryLimitsBox'
import { Textarea } from '@renderer/components/Textarea'

import { TestHelper } from '@renderer/helpers/TestHelper'

import { useImportAction } from '@renderer/hooks/useImportAction'
import { useLogin } from '@renderer/hooks/useLogin'

import { bsAggregator } from '@renderer/libs/blockchain-service'
import { TAccountsToImport } from '@shared/types/blockchain'

const LoginKeyPage = () => {
  const { t } = useTranslation('pages', { keyPrefix: 'loginKey' })
  const { t: commonT } = useTranslation('common')
  const navigate = useNavigate()
  const { loginWithKey } = useLogin()

  const submitKey = async (key: string) => {
    navigate('/login-key-select-account', { state: { mnemonicOrKey: key } })
  }

  const submitMnemonic = async (mnemonic: string) => {
    navigate('/login-key-select-account', { state: { mnemonicOrKey: mnemonic } })
  }

  const submitAddress = async (address: string) => {
    const blockchains = bsAggregator.getBlockchainNameByAddress(address)
    const accountsToImport: TAccountsToImport = blockchains.map(blockchain => ({
      blockchain,
      address,
      type: 'watch',
    }))

    await loginWithKey(accountsToImport, {
      name: commonT('wallet.watchAccount'),
      type: 'standard',
    })
    navigate('/wallets')
  }

  const { actionData, actionState, handleAct, handleChange, handleSubmit } = useImportAction(
    {
      key: submitKey,
      mnemonic: submitMnemonic,
      address: submitAddress,
    },
    { verifyIfAddressAlreadyExists: false }
  )

  return (
    <Fragment>
      <p className="text-center text-sm text-white">{t('description')}</p>
      <form className="mt-6 flex w-full grow flex-col items-center justify-between" onSubmit={handleAct(handleSubmit)}>
        <div className="flex w-full flex-col items-center">
          <Textarea
            placeholder={t('inputPlaceholder')}
            error={!!actionState.errors.text}
            value={actionData.text}
            onChange={handleChange}
            clearable
            pastable
            multiline={actionData.inputType === 'mnemonic'}
            {...TestHelper.buildTestObject('login-key-textarea')}
          />

          <TemporaryLimitsBox className="mt-4 w-full" />
        </div>

        <Button
          label={commonT('general.next')}
          className="mt-4 w-[250px]"
          variant="contained"
          type="submit"
          disabled={!actionState.isValid || actionState.isActing}
          loading={actionState.isActing}
          {...TestHelper.buildTestObject('login-key-submit')}
        />
      </form>
    </Fragment>
  )
}

export default LoginKeyPage
