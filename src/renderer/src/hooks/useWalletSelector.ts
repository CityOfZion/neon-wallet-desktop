import { useCallback } from 'react'

import { useAppSelector } from './useRedux'
import { useEncryptedPasswordSelector } from './useSettingsSelector'

export const useWalletsSelector = () => {
  const { ref, value } = useAppSelector(state => state.wallet.data)
  return {
    wallets: value,
    walletsRef: ref,
  }
}

export const useWalletSelectorByID = (id: string) => {
  const { value, ref } = useAppSelector(state => {
    const foundWallet = state.wallet.data.find(wallet => wallet.id === id)
    if (!foundWallet) throw new Error(`Wallet with id ${id} not found`)
    return foundWallet
  })

  return { wallet: value, walletRef: ref }
}

export const useWalletsUtils = () => {
  const { walletsRef } = useWalletsSelector()
  const { encryptedPasswordRef } = useEncryptedPasswordSelector()

  const doesMnemonicExist = useCallback(
    async (mnemonic: string) => {
      for (const wallet of walletsRef.current) {
        if (!wallet.encryptedMnemonic) continue

        const walletMnemonic = await window.api.sendAsync('decryptBasedEncryptedSecret', {
          value: wallet.encryptedMnemonic,
          encryptedSecret: encryptedPasswordRef.current,
        })

        if (walletMnemonic === mnemonic) return true
      }

      return false
    },
    [walletsRef, encryptedPasswordRef]
  )

  return {
    doesMnemonicExist,
  }
}
