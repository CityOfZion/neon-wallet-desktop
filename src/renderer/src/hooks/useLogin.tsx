import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { LOGIN_CONTROL_VALUE } from '@renderer/constants/password'
import { UtilsHelper } from '@renderer/helpers/UtilsHelper'
import { authReducerActions } from '@renderer/store/reducers/AuthReducer'
import { TAccountsToImport, TWalletToCreate } from '@shared/@types/blockchain'
import { THardwareWalletInfo } from '@shared/@types/ipc'

import { useBlockchainActions } from './useBlockchainActions'
import { useHardwareWalletActions } from './useHardwareWallet'
import { useAppDispatch } from './useRedux'
import { useLoginControlSelector } from './useSettingsSelector'
import { useWalletsSelector } from './useWalletSelector'

export const useLogin = () => {
  const { encryptedLoginControlRef } = useLoginControlSelector()
  const dispatch = useAppDispatch()
  const { t } = useTranslation('hooks', { keyPrefix: 'useLogin' })
  const { createWallet, importAccounts } = useBlockchainActions()
  const { createHardwareWallet } = useHardwareWalletActions()
  const { walletsRef } = useWalletsSelector()

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

      const walletPromises = walletsRef.current.map(async wallet => {
        const accountPromises = wallet.accounts.map(async account => {
          if (!account.encryptedKey) return
          await window.api.sendAsync('decryptBasedEncryptedSecret', {
            value: account.encryptedKey,
            encryptedSecret: encryptedPassword,
          })
        })

        await Promise.all(accountPromises)

        if (!wallet.encryptedMnemonic) return
        await window.api.sendAsync('decryptBasedEncryptedSecret', {
          value: wallet.encryptedMnemonic,
          encryptedSecret: encryptedPassword,
        })
      })

      await Promise.all(walletPromises)

      dispatch(
        authReducerActions.setCurrentLoginSession({
          type: 'password',
          encryptedPassword,
        })
      )
    },
    [encryptedLoginControlRef, walletsRef, dispatch, t]
  )

  const loginWithHardwareWallet = useCallback(
    async (hardwareWalletInfo: THardwareWalletInfo) => {
      const randomPassword = UtilsHelper.uuid()
      const encryptedPassword = await window.api.sendAsync('encryptBasedOS', randomPassword)

      dispatch(authReducerActions.setCurrentLoginSession({ type: 'hardware', encryptedPassword }))

      await createHardwareWallet(hardwareWalletInfo)
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
    window.api.sendAsync('disconnectHardwareWallet')

    dispatch(authReducerActions.setCurrentLoginSession(undefined))
  }, [dispatch])

  return {
    loginWithPassword,
    loginWithHardwareWallet,
    loginWithKey,
    logout,
  }
}
