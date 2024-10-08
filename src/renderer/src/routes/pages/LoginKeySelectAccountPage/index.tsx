import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Location, useLocation, useNavigate } from 'react-router-dom'
import { Button } from '@renderer/components/Button'
import {
  MnemonicOrKeyAccountSelection,
  TMnemonicOrKeyAccountWithBlockchain,
} from '@renderer/components/MnemonicOrKeyAccountSelection'
import { TestHelper } from '@renderer/helpers/TestHelper'
import { UtilsHelper } from '@renderer/helpers/UtilsHelper'
import { useLoadingActions } from '@renderer/hooks/useLoadingActions'
import { useLogin } from '@renderer/hooks/useLogin'
import { LoginKeyLayout } from '@renderer/layouts/LoginKeyLayout'
import { TAccountsToImport } from '@shared/@types/blockchain'

type TState = {
  mnemonicOrKey: string
}

export const LoginKeySelectAccountPage = () => {
  const {
    state: { mnemonicOrKey },
  } = useLocation() as Location<TState>
  const { t: commonT } = useTranslation('common')
  const { t } = useTranslation('pages', { keyPrefix: 'loginKeySelectAccountPage' })
  const { loginWithKey } = useLogin()
  const navigate = useNavigate()

  const { handleAct: handleActSelected, isActing: isActingSelected } = useLoadingActions()
  const { handleAct: handleActAll, isActing: isActingAll } = useLoadingActions()

  const [selectedAccounts, setSelectedAccounts] = useState<TMnemonicOrKeyAccountWithBlockchain[]>([])
  const [allAccounts, setAllAccounts] = useState<TMnemonicOrKeyAccountWithBlockchain[]>([])

  const handleImport = async (accountsToImport: TMnemonicOrKeyAccountWithBlockchain[]) => {
    const isMnemonic = UtilsHelper.isValidMnemonic(mnemonicOrKey)
    const accounts: TAccountsToImport = accountsToImport.map(account => ({ ...account, type: 'standard' }))
    await loginWithKey(accounts, {
      name: isMnemonic ? commonT('wallet.mnemonicWalletName') : commonT('wallet.importedName'),
      type: 'standard',
      mnemonic: isMnemonic ? mnemonicOrKey : undefined,
    })

    // It improves the user experience
    await UtilsHelper.sleep(1000)

    navigate('/app/portfolio')
  }

  return (
    <LoginKeyLayout heading={t('title')}>
      <p className="mt-10 text-white text-sm">{t('description')}</p>

      <MnemonicOrKeyAccountSelection
        className="mt-6 flex-grow mb-3 scrollbar-overlay"
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
          onClick={handleActAll(() => handleImport(allAccounts))}
          {...TestHelper.buildTestObject('login-key-select-account-import-all')}
        />

        <Button
          variant="contained"
          label={t('importSelectedButtonLabel')}
          wide
          disabled={selectedAccounts.length === 0 || isActingAll}
          loading={isActingSelected}
          onClick={handleActSelected(() => handleImport(selectedAccounts))}
          {...TestHelper.buildTestObject('login-key-select-account-import-selected')}
        />
      </div>
    </LoginKeyLayout>
  )
}
