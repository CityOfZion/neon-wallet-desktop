import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { Button } from '@renderer/components/Button'
import { TemporaryLimitsBox } from '@renderer/components/TemporaryLimitsBox'
import { Textarea } from '@renderer/components/Textarea'
import { TestHelper } from '@renderer/helpers/TestHelper'
import { useImportAction } from '@renderer/hooks/useImportAction'
import { useLogin } from '@renderer/hooks/useLogin'
import { WelcomeWithTabsLayout } from '@renderer/layouts/WelcomeWithTabs'
import { bsAggregator } from '@renderer/libs/blockchainService'
import { TAccountsToImport } from '@shared/@types/blockchain'

export const LoginKeyPage = () => {
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
    navigate('/app/portfolio')
  }

  const { actionData, actionState, handleAct, handleChange, handleSubmit } = useImportAction({
    key: submitKey,
    mnemonic: submitMnemonic,
    address: submitAddress,
  })

  return (
    <WelcomeWithTabsLayout tabItemSelected="key">
      <p className="text-sm text-white text-center">{t('description')}</p>
      <form
        className="mt-6 flex flex-col w-full items-center justify-between flex-grow"
        onSubmit={handleAct(handleSubmit)}
      >
        <div className="flex flex-col items-center">
          <Textarea
            placeholder={t('inputPlaceholder')}
            error={!!actionState.errors.text}
            value={actionData.text}
            onChange={handleChange}
            clearable
            multiline={actionData.inputType === 'mnemonic'}
            {...TestHelper.buildTestObject('login-key-textarea')}
          />

          <TemporaryLimitsBox className="mt-4" />
        </div>

        <Button
          label={commonT('general.next')}
          className="w-[250px]"
          variant="contained"
          type="submit"
          disabled={!actionState.isValid || actionState.isActing}
          loading={actionState.isActing}
          {...TestHelper.buildTestObject('login-key-submit')}
        />
      </form>
    </WelcomeWithTabsLayout>
  )
}
