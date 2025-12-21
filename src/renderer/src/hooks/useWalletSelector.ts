import { useCallback, useRef } from 'react'

import { useSelector } from 'react-redux'

import type { TRootState } from '@renderer/types/redux'
import type { IWalletState } from '@shared/types/store'

import { useCurrentLoginSessionSelector } from './useAuthSelector'
import { createAppSelector, useAppSelector } from './useRedux'

const selectWallets = createAppSelector(
  [state => state.auth.data.applicationDataByLoginType, state => state.auth.inMemoryData.currentLoginSession],
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

export const useWalletsMapSelector = () => {
  const walletsMapRef = useRef<Map<string, IWalletState>>(new Map())

  useSelector((state: TRootState) => {
    const wallets = selectWallets(state)

    walletsMapRef.current.clear()

    wallets.forEach(wallet => {
      walletsMapRef.current.set(wallet.id, wallet)
    })
  })

  return { walletsMapRef }
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
