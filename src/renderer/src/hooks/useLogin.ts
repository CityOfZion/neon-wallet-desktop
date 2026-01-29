import { useCallback } from 'react'

import { TBSAccount } from '@cityofzion/blockchain-service'
import { useTranslation } from 'react-i18next'

import { UtilsHelper } from '@renderer/helpers/UtilsHelper'

import { authReducerActions } from '@renderer/store/reducers/auth'
import { settingsReducerActions } from '@renderer/store/reducers/settings'
import { AppError } from '@shared/helpers/SharedErrorHelper'
import { SharedUtilsHelper } from '@shared/helpers/SharedUtilsHelper'
import { TAccountsToImport, TBlockchainServiceKey, TUseCreateWalletParams } from '@shared/types/blockchain'

import { useImportAccounts } from './useAccountActions'
import { useCreateHardwareWallet } from './useHardwareWallet'
import { useAppDispatch } from './useRedux'
import { useLoginControlSelector } from './useSettingsSelector'
import { useCreateWallet } from './useWalletActions'

const LOGIN_CONTROL_VALUE = 'true'

export const useLogin = () => {
  const { encryptedLoginControlRef } = useLoginControlSelector()
  const dispatch = useAppDispatch()
  const { t } = useTranslation('hooks', { keyPrefix: 'useLogin' })
  const { createWallet } = useCreateWallet()
  const { importAccounts } = useImportAccounts()
  const { createHardwareWallet } = useCreateHardwareWallet()

  const loginWithPassword = useCallback(
    async (password: string) => {
      if (!encryptedLoginControlRef.current) {
        throw new AppError(t('controlIsNotSet'))
      }

      const encryptedPassword = await window.api.sendAsync('encryption:encryptBasedOS', password)

      const decryptedLoginControl = await window.api.sendAsync('encryption:decryptBasedEncryptedSecret', {
        value: encryptedLoginControlRef.current,
        encryptedSecret: encryptedPassword,
      })

      if (decryptedLoginControl !== LOGIN_CONTROL_VALUE) {
        throw new AppError(t('controlIsNotValid'))
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
    async (accounts: TBSAccount<TBlockchainServiceKey>[]) => {
      const randomPassword = UtilsHelper.uuid()
      const encryptedPassword = await window.api.sendAsync('encryption:encryptBasedOS', randomPassword)

      dispatch(authReducerActions.setCurrentLoginSession({ type: 'hardware', encryptedPassword }))

      // Prevent the login session from being not set within createHardwareWallet
      await SharedUtilsHelper.sleep(500)

      await createHardwareWallet(accounts)
    },
    [createHardwareWallet, dispatch]
  )

  const loginWithKey = useCallback(
    async (accountsToCreate: TAccountsToImport, walletToCreate: TUseCreateWalletParams) => {
      const randomPassword = UtilsHelper.uuid()
      const encryptedPassword = await window.api.sendAsync('encryption:encryptBasedOS', randomPassword)

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
    dispatch(settingsReducerActions.setSelectedWallet(undefined))
    dispatch(settingsReducerActions.setSelectedAccount(undefined))
    await window.api.sendAsync('hardwareWallet:disconnect')
  }, [dispatch])

  return {
    loginWithPassword,
    loginWithHardwareWallet,
    loginWithKey,
    logout,
  }
}

export const useSignup = () => {
  const dispatch = useAppDispatch()

  const signup = useCallback(
    async (password: string, isAlreadyEncrypted?: boolean) => {
      const encryptedPassword = !isAlreadyEncrypted
        ? await window.api.sendAsync('encryption:encryptBasedOS', password)
        : password

      const encryptedLoginControl = await window.api.sendAsync('encryption:encryptBasedEncryptedSecret', {
        value: LOGIN_CONTROL_VALUE,
        encryptedSecret: encryptedPassword,
      })

      dispatch(settingsReducerActions.setHasPassword(true))
      dispatch(settingsReducerActions.setEncryptedLoginControl(encryptedLoginControl))
      dispatch(authReducerActions.setCurrentLoginSession({ type: 'password', encryptedPassword }))
    },
    [dispatch]
  )

  return {
    signup,
  }
}
