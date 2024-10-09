import { useCallback } from 'react'
import { TLoginSessionType } from '@shared/@types/store'

import { useCurrentLoginSessionSelector } from './useAuthSelector'
import { createAppSelector, useAppSelector } from './useRedux'

const selectWallets = createAppSelector(
  [state => state.auth.data.applicationDataByLoginType, state => state.auth.currentLoginSession],
  (applicationDataByLoginType, currentLoginSession) => {
    return applicationDataByLoginType[currentLoginSession?.type ?? 'password'].wallets
  }
)

export const useWalletsSelector = () => {
  const { ref, value } = useAppSelector(selectWallets)

  return {
    wallets: value,
    walletsRef: ref,
  }
}

export const useWalletsUtils = () => {
  const { walletsRef } = useWalletsSelector()
  const { currentLoginSessionRef } = useCurrentLoginSessionSelector()

  const doesMnemonicExist = useCallback(
    async (mnemonic: string) => {
      if (!currentLoginSessionRef.current) {
        throw new Error('You need to be logged in to access wallets')
      }

      for (const wallet of walletsRef.current) {
        if (!wallet.encryptedMnemonic) continue

        const walletMnemonic = await window.api.sendAsync('decryptBasedEncryptedSecret', {
          value: wallet.encryptedMnemonic,
          encryptedSecret: currentLoginSessionRef.current.encryptedPassword,
        })

        if (walletMnemonic === mnemonic) return true
      }

      return false
    },
    [walletsRef, currentLoginSessionRef]
  )

  return {
    doesMnemonicExist,
  }
}

export const useWalletsSelectorLazy = () => {
  const { ref: applicationDataByLoginTypeRef } = useAppSelector(state => state.auth.data.applicationDataByLoginType)

  const getWallets = useCallback(
    (loginSessionType: TLoginSessionType) => applicationDataByLoginTypeRef.current[loginSessionType].wallets,
    [applicationDataByLoginTypeRef]
  )

  return {
    getWallets,
  }
}
