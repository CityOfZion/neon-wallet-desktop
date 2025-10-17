import { useState } from 'react'

import { BSKeychainHelper } from '@cityofzion/blockchain-service'
import { useTranslation } from 'react-i18next'
import { Location, useLocation, useNavigate } from 'react-router'

import { Button } from '@renderer/components/Button'
import {
  MnemonicOrKeyAccountSelection,
  TMnemonicOrKeyAccountWithBlockchain,
} from '@renderer/components/MnemonicOrKeyAccountSelection'

import { TestHelper } from '@renderer/helpers/TestHelper'

import { useLoadingActions } from '@renderer/hooks/useLoadingActions'
import { useLogin } from '@renderer/hooks/useLogin'

import { WelcomeLayout } from '@renderer/layouts/Welcome'

import { TAccountsToImport } from '@shared/@types/blockchain'
import { SharedUtilsHelper } from '@shared/helpers/SharedUtilsHelper'

type TState = {
  mnemonicOrKey: string
}

const LoginKeySelectAccountPage = () => {
  const {
    state: { mnemonicOrKey },
  } = useLocation() as Location<TState>
  const { t: commonT } = useTranslation('common')
  const { t } = useTranslation('pages', { keyPrefix: 'loginKeySelectAccountPage' })
  const { loginWithKey } = useLogin()
  const navigate = useNavigate()

  const [selectedAccounts, setSelectedAccounts] = useState<TMnemonicOrKeyAccountWithBlockchain[]>([])
  const [allAccounts, setAllAccounts] = useState<TMnemonicOrKeyAccountWithBlockchain[]>([])

  const handleImport = async (accountsToImport: TMnemonicOrKeyAccountWithBlockchain[]) => {
    const isMnemonic = BSKeychainHelper.isValidMnemonic(mnemonicOrKey)
    const accounts: TAccountsToImport = accountsToImport.map(account => ({ ...account, type: 'standard' }))
    await loginWithKey(accounts, {
      name: isMnemonic ? commonT('wallet.mnemonicWalletName') : commonT('wallet.importedName'),
      type: 'standard',
      mnemonic: isMnemonic ? mnemonicOrKey : undefined,
    })

    // It improves the user experience
    await SharedUtilsHelper.sleep(1000)

    navigate('/wallets')
  }

  const { handleAct: handleActSelected, isActing: isActingSelected } = useLoadingActions(() =>
    handleImport(selectedAccounts)
  )
  const { handleAct: handleActAll, isActing: isActingAll } = useLoadingActions(() => handleImport(allAccounts))

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
          loading={isActingAll}
          disabled={allAccounts.length === 0 || isActingSelected}
          onClick={handleActAll}
          {...TestHelper.buildTestObject('login-key-select-account-import-all')}
        />

        <Button
          variant="contained"
          label={t('importSelectedButtonLabel')}
          wide
          disabled={selectedAccounts.length === 0 || isActingAll}
          loading={isActingSelected}
          onClick={handleActSelected}
          {...TestHelper.buildTestObject('login-key-select-account-import-selected')}
        />
      </div>
    </WelcomeLayout>
  )
}

export default LoginKeySelectAccountPage
