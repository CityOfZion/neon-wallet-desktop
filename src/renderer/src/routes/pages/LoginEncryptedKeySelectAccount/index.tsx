import { ChangeEvent, Fragment, useState } from 'react'

import { hasEncryption } from '@cityofzion/blockchain-service'
import { useTranslation } from 'react-i18next'
import { Location, useLocation } from 'react-router'

import { Button } from '@renderer/components/Button'
import { Input } from '@renderer/components/Input'
import {
  MnemonicOrKeyAccountSelection,
  TMnemonicOrKeyAccountWithBlockchain,
} from '@renderer/components/MnemonicOrKeyAccountSelection'

import { BlockchainServiceHelper } from '@renderer/helpers/BlockchainServiceHelper'
import { LoggerHelper } from '@renderer/helpers/LoggerHelper'
import { TestHelper } from '@renderer/helpers/TestHelper'
import { ToastHelper } from '@renderer/helpers/ToastHelper'

import { useActions } from '@renderer/hooks/useActions'
import { useLogin } from '@renderer/hooks/useLogin'
import { useNavigateReset } from '@renderer/hooks/useNavigateReset'
import { usePressOnce } from '@renderer/hooks/usePressOnce'

import { WelcomeLayout } from '@renderer/layouts/Welcome'

import { SharedUtilsHelper } from '@shared/helpers/SharedUtilsHelper'
import { TAccountsToImport } from '@shared/types/blockchain'

type TLocationState = {
  encryptedKey: string
}

type TActionsData = {
  password: string
}

const LoginEncryptedKeySelectAccountPage = () => {
  const {
    state: { encryptedKey },
  } = useLocation() as Location<TLocationState>

  const { t } = useTranslation('pages', { keyPrefix: 'loginEncryptedKeySelectAccount' })
  const { t: tCommon } = useTranslation('common')
  const { loginWithKey } = useLogin()
  const navigateReset = useNavigateReset()

  const [decryptedKey, setDecryptedKey] = useState<string | null>(null)
  const [selectedAccounts, setSelectedAccounts] = useState<TMnemonicOrKeyAccountWithBlockchain[]>([])
  const [accounts, setAccounts] = useState<TMnemonicOrKeyAccountWithBlockchain[]>([])

  const { actionData, setData, actionState, handleAct } = useActions<TActionsData>({ password: '' })

  const handlePasswordChange = (event: ChangeEvent<HTMLInputElement>) => {
    setData({ password: event.target.value })
  }

  const [isDecrypting, startDecrypt] = usePressOnce(async () => {
    if (!actionState.isValid || actionState.isActing) return

    try {
      const services = Object.values(BlockchainServiceHelper.bsAggregator.blockchainServicesByName)
      let found = false

      for (const service of services) {
        if (hasEncryption(service) && service.validateEncrypted(encryptedKey)) {
          let key: string | null = null

          try {
            const response = await service.decrypt(encryptedKey, actionData.password)

            key = response.key
          } catch {
            /* empty */
          }

          if (key) {
            setDecryptedKey(key)

            found = true

            break
          }
        }
      }

      if (!found) ToastHelper.error({ message: t('errors.noEncryptionInterface') })
    } catch (error) {
      LoggerHelper.error(error, { where: 'LoginEncryptedKeySelectAccountPage', operation: 'decrypt' })
      ToastHelper.error({ message: t('errors.decrypt') })
    }
  })

  const handleImport = async (accountsToImport: TMnemonicOrKeyAccountWithBlockchain[]) => {
    const accounts: TAccountsToImport = accountsToImport.map(account => ({ ...account, type: 'standard' }))

    await loginWithKey(accounts, {
      name: tCommon('wallet.encryptedName'),
      type: 'standard',
    })

    await SharedUtilsHelper.sleep(1000)

    navigateReset('/wallets/overview')
  }

  const [isImportingSelected, startImportSelected] = usePressOnce(() => handleImport(selectedAccounts))
  const [isImportingAll, startImportAll] = usePressOnce(() => handleImport(accounts))

  return (
    <WelcomeLayout heading={t('title')} withBackButton className="flex-col justify-between">
      <p className="mt-10 text-sm text-white">{t('selectDescription')}</p>

      {!decryptedKey ? (
        <form
          className="mt-6 flex w-full grow flex-col items-center justify-between"
          onSubmit={handleAct(startDecrypt)}
        >
          <Input
            clearable
            autoFocus
            className="w-full"
            placeholder={t('passwordPlaceholder')}
            value={actionData.password}
            onChange={handlePasswordChange}
            type="password"
            disabled={isDecrypting}
            {...TestHelper.buildTestObject('login-encrypted-key-password')}
          />

          <Button
            label={tCommon('general.next')}
            className="mt-8 w-62.5"
            variant="contained"
            type="submit"
            disabled={!actionState.isValid || actionState.isActing || isDecrypting}
            loading={isDecrypting}
            {...TestHelper.buildTestObject('login-encrypted-key-decrypt-submit')}
          />
        </form>
      ) : (
        <Fragment>
          <MnemonicOrKeyAccountSelection
            className="scrollbar-overlay my-6 grow"
            mnemonicOrKey={decryptedKey}
            selectedAccounts={selectedAccounts}
            onSelect={setSelectedAccounts}
            onMount={setAccounts}
          />

          <div className="flex gap-2.5">
            <Button
              variant="outlined"
              label={t('importAllButtonLabel')}
              wide
              loading={isImportingAll}
              disabled={accounts.length === 0 || isImportingSelected}
              onClick={startImportAll}
              {...TestHelper.buildTestObject('login-encrypted-key-import-all')}
            />

            <Button
              variant="contained"
              label={t('importSelectedButtonLabel')}
              wide
              disabled={selectedAccounts.length === 0 || isImportingAll}
              loading={isImportingSelected}
              onClick={startImportSelected}
              {...TestHelper.buildTestObject('login-encrypted-key-import-selected')}
            />
          </div>
        </Fragment>
      )}
    </WelcomeLayout>
  )
}

export default LoginEncryptedKeySelectAccountPage
