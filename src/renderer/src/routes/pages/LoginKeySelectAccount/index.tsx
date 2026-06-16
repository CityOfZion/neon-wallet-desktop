import { useState } from 'react'

import { BSKeychainHelper } from '@cityofzion/blockchain-service'
import { useTranslation } from 'react-i18next'
import { Location, useLocation, useNavigate } from 'react-router'

import { Button } from '@renderer/components/Button'
import { Checkbox } from '@renderer/components/Checkbox'
import {
  MnemonicOrKeyAccountSelection,
  TMnemonicOrKeyAccountWithBlockchain,
} from '@renderer/components/MnemonicOrKeyAccountSelection'

import { TestHelper } from '@renderer/helpers/TestHelper'

import { useShouldConfirmActionSelector } from '@renderer/hooks/useAuthSelector'
import { useLogin } from '@renderer/hooks/useLogin'
import { usePressOnce } from '@renderer/hooks/usePressOnce'
import { useAppDispatch } from '@renderer/hooks/useRedux'

import { WelcomeLayout } from '@renderer/layouts/Welcome'

import { authReducerActions } from '@renderer/store/reducers/auth'
import { SharedUtilsHelper } from '@shared/helpers/SharedUtilsHelper'
import { TAccountsToImport } from '@shared/types/blockchain'

type TLocationState = {
  mnemonicOrKey: string
}

const LoginKeySelectAccountPage = () => {
  const {
    state: { mnemonicOrKey },
  } = useLocation() as Location<TLocationState>
  const { t: tCommon } = useTranslation('common')
  const { t } = useTranslation('pages', { keyPrefix: 'loginKeySelectAccountPage' })

  const { shouldConfirmAction } = useShouldConfirmActionSelector('key')
  const [isShouldConfirmAction, setIsShouldConfirmAction] = useState(shouldConfirmAction)
  const { loginWithKey } = useLogin()

  const navigate = useNavigate()
  const dispatch = useAppDispatch()

  const [selectedAccounts, setSelectedAccounts] = useState<TMnemonicOrKeyAccountWithBlockchain[]>([])
  const [allAccounts, setAllAccounts] = useState<TMnemonicOrKeyAccountWithBlockchain[]>([])

  const handleIsShouldConfirmActionChange = (value: boolean) => {
    setIsShouldConfirmAction(value)
  }

  const handleImport = async (accountsToImport: TMnemonicOrKeyAccountWithBlockchain[]) => {
    const isMnemonic = BSKeychainHelper.isValidMnemonic(mnemonicOrKey)
    const accounts: TAccountsToImport = accountsToImport.map(account => ({ ...account, type: 'standard' }))
    await loginWithKey(accounts, {
      name: isMnemonic ? tCommon('wallet.mnemonicWalletName') : tCommon('wallet.importedName'),
      type: 'standard',
      mnemonic: isMnemonic ? mnemonicOrKey : undefined,
    })

    dispatch(authReducerActions.setShouldConfirmAction(isShouldConfirmAction))

    // It improves the user experience
    await SharedUtilsHelper.sleep(1000)

    navigate('/wallets/overview')
  }

  const [isImportingSelected, startImportSelected] = usePressOnce(() => handleImport(selectedAccounts))

  const [isImportingAll, startImportAll] = usePressOnce(() => handleImport(allAccounts))

  return (
    <WelcomeLayout heading={t('title')} withBackButton className="flex-col justify-between">
      <p className="mt-10 text-sm text-white">{t('description')}</p>

      <MnemonicOrKeyAccountSelection
        className="scrollbar-overlay my-6 grow"
        mnemonicOrKey={mnemonicOrKey}
        selectedAccounts={selectedAccounts}
        onSelect={setSelectedAccounts}
        onMount={setAllAccounts}
      />
      <div className="flex gap-2.5">
        <Button
          variant="outlined"
          label={t('importAllButtonLabel')}
          wide
          loading={isImportingAll}
          disabled={allAccounts.length === 0 || isImportingSelected}
          onClick={startImportAll}
          {...TestHelper.buildTestObject('login-key-select-account-import-all')}
        />

        <Button
          variant="contained"
          label={t('importSelectedButtonLabel')}
          wide
          disabled={selectedAccounts.length === 0 || isImportingAll}
          loading={isImportingSelected}
          onClick={startImportSelected}
          {...TestHelper.buildTestObject('login-key-select-account-import-selected')}
        />
      </div>

      <div className="flex items-center justify-center gap-2 pt-4 text-white">
        <Checkbox
          id="should-confirm-action"
          checked={isShouldConfirmAction}
          onCheckedChange={handleIsShouldConfirmActionChange}
        />
        <label htmlFor="should-confirm-action">{t('shouldConfirmActionKeyCheckboxLabel')}</label>
      </div>
    </WelcomeLayout>
  )
}

export default LoginKeySelectAccountPage
