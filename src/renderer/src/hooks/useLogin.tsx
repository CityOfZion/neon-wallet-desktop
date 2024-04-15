import { useCallback } from 'react'
import { settingsReducerActions } from '@renderer/store/reducers/SettingsReducer'

import { useAccountsSelector } from './useAccountSelector'
import { useAppDispatch } from './useRedux'
import { useWalletsSelector } from './useWalletSelector'

export const useLogin = () => {
  const { walletsRef } = useWalletsSelector()
  const { accountsRef } = useAccountsSelector()
  const dispatch = useAppDispatch()

  const login = useCallback(
    async (password: string) => {
      const encryptedPassword = await window.api.encryptBasedOS(password)

      const walletPromises = walletsRef.current.map(async wallet => {
        if (!wallet.encryptedMnemonic) return
        await window.api.decryptBasedEncryptedSecret(wallet.encryptedMnemonic, encryptedPassword)
      })

      const accountPromises = accountsRef.current.map(async account => {
        if (!account.encryptedKey) return
        await window.api.decryptBasedEncryptedSecret(account.encryptedKey, encryptedPassword)
      })

      await Promise.all([...walletPromises, ...accountPromises])
      dispatch(settingsReducerActions.setEncryptedPassword(encryptedPassword))
    },
    [walletsRef, accountsRef, dispatch]
  )

  const logout = useCallback(() => {
    dispatch(settingsReducerActions.setEncryptedPassword(undefined))
  }, [dispatch])

  return {
    login,
    logout,
  }
}
