import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { LOGIN_CONTROL_VALUE } from '@renderer/constants/password'
import { UtilsHelper } from '@renderer/helpers/UtilsHelper'
import { settingsReducerActions } from '@renderer/store/reducers/SettingsReducer'
import { THardwareWalletInfo } from '@shared/@types/ipc'

import { useAccountsSelector } from './useAccountSelector'
import { useBlockchainActions } from './useBlockchainActions'
import { usePersistStore } from './usePersistStore'
import { useAppDispatch } from './useRedux'
import { useLoginControlSelector } from './useSettingsSelector'
import { useWalletsSelector } from './useWalletSelector'

export const useLogin = () => {
  const { walletsRef } = useWalletsSelector()
  const { accountsRef } = useAccountsSelector()
  const { encryptedLoginControlRef } = useLoginControlSelector()
  const dispatch = useAppDispatch()
  const { t } = useTranslation('hooks', { keyPrefix: 'useLogin' })
  const { t: commonT } = useTranslation('common')
  const { createWallet, importAccount } = useBlockchainActions()
  const { pause, resume } = usePersistStore()

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
        if (!wallet.encryptedMnemonic) return
        await window.api.sendAsync('decryptBasedEncryptedSecret', {
          value: wallet.encryptedMnemonic,
          encryptedSecret: encryptedPassword,
        })
      })

      const accountPromises = accountsRef.current
        .filter(account => account.type !== 'hardware')
        .map(async account => {
          if (!account.encryptedKey) return
          await window.api.sendAsync('decryptBasedEncryptedSecret', {
            value: account.encryptedKey,
            encryptedSecret: encryptedPassword,
          })
        })

      await Promise.all([...walletPromises, ...accountPromises])

      dispatch(
        settingsReducerActions.setLoginSession({
          type: 'password',
          encryptedPassword,
        })
      )
    },
    [encryptedLoginControlRef, walletsRef, accountsRef, dispatch, t]
  )

  const loginWithHardwareWallet = useCallback(
    async (hardwareWalletInfo: THardwareWalletInfo) => {
      pause()

      const randomPassword = UtilsHelper.uuid()
      const encryptedPassword = await window.api.sendAsync('encryptBasedOS', randomPassword)

      dispatch(settingsReducerActions.setLoginSession({ type: 'hardware', encryptedPassword }))

      const wallet = createWallet({ name: commonT('wallet.ledgerName'), type: 'hardware' })
      importAccount({
        wallet,
        address: hardwareWalletInfo.address,
        blockchain: hardwareWalletInfo.blockchain,
        type: 'hardware',
        key: hardwareWalletInfo.publicKey,
      })
    },
    [commonT, createWallet, dispatch, importAccount, pause]
  )

  const logout = useCallback(async () => {
    resume()
    dispatch(settingsReducerActions.setLoginSession(undefined))
  }, [dispatch, resume])

  return {
    loginWithPassword,
    loginWithHardwareWallet,
    logout,
  }
}
