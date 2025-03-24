import { useCallback } from 'react'

import { useCurrentLoginSessionSelector } from './useAuthSelector'
import { createAppSelector, useAppSelector } from './useRedux'

const selectWallets = createAppSelector(
  [state => state.auth.data.applicationDataByLoginType, state => state.auth.inMemoryData.currentLoginSession],
  (applicationDataByLoginType, currentLoginSession) => {
    return applicationDataByLoginType[currentLoginSession?.type ?? 'password'].wallets
  }
)

const selectWalletById = (id: string) =>
  createAppSelector(
    [({ auth }) => auth.data.applicationDataByLoginType, ({ auth }) => auth.inMemoryData.currentLoginSession],
    (applicationDataByLoginType, currentLoginSession) =>
      applicationDataByLoginType[currentLoginSession?.type ?? 'password'].wallets.find(wallet => wallet.id === id)
  )

export const useWalletsSelector = () => {
  const { ref, value } = useAppSelector(selectWallets)

  return {
    wallets: value,
    walletsRef: ref,
  }
}

export const useWalletByIdSelector = (id: string) => {
  const { value: wallet, ref: walletRef } = useAppSelector(selectWalletById(id))

  return { wallet, walletRef }
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
