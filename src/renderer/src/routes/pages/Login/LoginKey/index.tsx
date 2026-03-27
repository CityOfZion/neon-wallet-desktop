import { Fragment } from 'react'

import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'

import { Button } from '@renderer/components/Button'
import { TemporaryLimitsBox } from '@renderer/components/TemporaryLimitsBox'
import { Textarea } from '@renderer/components/Textarea'

import { BlockchainServiceHelper } from '@renderer/helpers/BlockchainServiceHelper'
import { TestHelper } from '@renderer/helpers/TestHelper'

import { useImportAction } from '@renderer/hooks/useImportAction'
import { useLogin } from '@renderer/hooks/useLogin'

import { SharedUtilsHelper } from '@shared/helpers/SharedUtilsHelper'
import { TAccountsToImport } from '@shared/types/blockchain'

export const LoginKeyTabContent = () => {
  const { t } = useTranslation('pages', { keyPrefix: 'loginKey' })
  const { t: tCommon } = useTranslation('common')
  const navigate = useNavigate()
  const { loginWithKey } = useLogin()

  const submitKey = async (key: string) => {
    navigate('/login-key-select-account', { state: { mnemonicOrKey: key } })
    // Improve UX
    await SharedUtilsHelper.sleep(2000)
  }

  const submitMnemonic = async (mnemonic: string) => {
    navigate('/login-key-select-account', { state: { mnemonicOrKey: mnemonic } })

    // Improve UX
    await SharedUtilsHelper.sleep(2000)
  }

  const submitAddress = async (address: string) => {
    const blockchains = BlockchainServiceHelper.bsAggregator.getBlockchainNameByAddress(address)
    const accountsToImport: TAccountsToImport = blockchains.map(blockchain => ({
      blockchain,
      address,
      type: 'watch',
    }))

    await loginWithKey(accountsToImport, {
      name: tCommon('wallet.watchAccount'),
      type: 'standard',
    })

    navigate('/wallets/overview')

    // Improve UX
    await SharedUtilsHelper.sleep(2000)
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
          label={tCommon('general.next')}
          className="mt-8 w-62.5"
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
