import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { LOGIN_CONTROL_VALUE } from '@renderer/constants/password'
import { settingsReducerActions } from '@renderer/store/reducers/SettingsReducer'

import { useAccountsSelector } from './useAccountSelector'
import { useAppDispatch } from './useRedux'
import { useLoginControlSelector } from './useSettingsSelector'
import { useWalletsSelector } from './useWalletSelector'

export const useLogin = () => {
  const { walletsRef } = useWalletsSelector()
  const { accountsRef } = useAccountsSelector()
  const { encryptedLoginControlRef } = useLoginControlSelector()
  const dispatch = useAppDispatch()
  const { t } = useTranslation('hooks', { keyPrefix: 'useLogin' })

  const login = useCallback(
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
        if (!wallet.encryptedMnemonic) return
        await window.api.sendAsync('decryptBasedEncryptedSecret', {
          value: wallet.encryptedMnemonic,
          encryptedSecret: encryptedPassword,
        })
      })

      const accountPromises = accountsRef.current
        .filter(account => account.type !== 'ledger')
        .map(async account => {
          if (!account.encryptedKey) return
          await window.api.sendAsync('decryptBasedEncryptedSecret', {
            value: account.encryptedKey,
            encryptedSecret: encryptedPassword,
          })
        })

      await Promise.all([...walletPromises, ...accountPromises])

      dispatch(settingsReducerActions.setEncryptedPassword(encryptedPassword))
    },
    [walletsRef, accountsRef, encryptedLoginControlRef, dispatch]
  )

  const logout = useCallback(() => {
    dispatch(settingsReducerActions.setEncryptedPassword(undefined))
  }, [dispatch])

  return {
    login,
    logout,
  }
}
