import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { Account } from '@cityofzion/blockchain-service'
import { LOGIN_CONTROL_VALUE } from '@renderer/constants/password'
import { UtilsHelper } from '@renderer/helpers/UtilsHelper'
import { authReducerActions } from '@renderer/store/reducers/AuthReducer'
import { TAccountsToImport, TBlockchainServiceKey, TWalletToCreate } from '@shared/@types/blockchain'
import { SharedUtilsHelper } from '@shared/helpers/SharedUtilsHelper'

import { useBlockchainActions } from './useBlockchainActions'
import { useHardwareWalletActions } from './useHardwareWallet'
import { useAppDispatch } from './useRedux'
import { useLoginControlSelector } from './useSettingsSelector'

export const useLogin = () => {
  const { encryptedLoginControlRef } = useLoginControlSelector()
  const dispatch = useAppDispatch()
  const { t } = useTranslation('hooks', { keyPrefix: 'useLogin' })
  const { createWallet, importAccounts } = useBlockchainActions()
  const { createHardwareWallet } = useHardwareWalletActions()

  const loginWithPassword = useCallback(
    async (password: string) => {
      if (!encryptedLoginControlRef.current) {
        throw new Error(t('controlIsNotSet'))
      }

      const encryptedPassword = await window.api.sendAsync('encryptBasedOS', password)

      const decryptedLoginControl = await window.api.sendAsync('decryptBasedEncryptedSecret', {
        value: encryptedLoginControlRef.current,
        encryptedSecret: encryptedPassword,
      })

      if (decryptedLoginControl !== LOGIN_CONTROL_VALUE) {
        throw new Error(t('controlIsNotValid'))
      }

      dispatch(
        authReducerActions.setCurrentLoginSession({
          type: 'password',
          encryptedPassword,
        })
      )
    },
    [encryptedLoginControlRef, dispatch, t]
  )

  const loginWithHardwareWallet = useCallback(
    async (accounts: Account<TBlockchainServiceKey>[]) => {
      const randomPassword = UtilsHelper.uuid()
      const encryptedPassword = await window.api.sendAsync('encryptBasedOS', randomPassword)

      dispatch(authReducerActions.setCurrentLoginSession({ type: 'hardware', encryptedPassword }))

      // Prevent the login session from being not set within createHardwareWallet
      await SharedUtilsHelper.sleep(500)

      await createHardwareWallet(accounts)
    },
    [createHardwareWallet, dispatch]
  )

  const loginWithKey = useCallback(
    async (accountsToCreate: TAccountsToImport, walletToCreate: TWalletToCreate) => {
      const randomPassword = UtilsHelper.uuid()
      const encryptedPassword = await window.api.sendAsync('encryptBasedOS', randomPassword)

      dispatch(authReducerActions.setCurrentLoginSession({ type: 'key', encryptedPassword }))

      const wallet = createWallet(walletToCreate)

      await importAccounts({
        accounts: accountsToCreate,
        wallet,
      })
    },
    [createWallet, dispatch, importAccounts]
  )

  const logout = useCallback(async () => {
    dispatch(authReducerActions.setCurrentLoginSession(undefined))
    await window.api.sendAsync('hardwareWallet:disconnect')
  }, [dispatch])

  return {
    loginWithPassword,
    loginWithHardwareWallet,
    loginWithKey,
    logout,
  }
}
