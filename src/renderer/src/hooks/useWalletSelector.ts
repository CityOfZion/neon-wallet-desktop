import { useCallback, useRef } from 'react'

import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'

import { SelectorHelper } from '@renderer/helpers/SelectorHelper'

import type { TRootState } from '@renderer/types/redux'
import { AppError } from '@shared/helpers/SharedErrorHelper'
import type { TWallet } from '@shared/types/store'

import { useLoginSessionSelector } from './useAuthSelector'
import { createAppSelector, useAppSelector } from './useRedux'

const selectWallets = createAppSelector(
  [state => state.auth.data.applicationDataByLoginType, state => state.auth.memoryData.loginSession],
  (applicationDataByLoginType, loginSession) => {
    if (!loginSession?.type) return SelectorHelper.fallbackToEmptyArray<TWallet>()

    return SelectorHelper.fallbackToEmptyArray<TWallet>(applicationDataByLoginType[loginSession.type].wallets)
  }
)

export const useWalletsSelector = () => {
  const { value, ref } = useAppSelector(selectWallets)

  return { wallets: value, walletsRef: ref }
}

export const useWalletsMapSelector = () => {
  const walletsMapRef = useRef<Map<string, TWallet>>(new Map())

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
  const { t } = useTranslation('common')
  const { walletsRef } = useWalletsSelector()
  const { loginSessionRef } = useLoginSessionSelector()

  const doesMnemonicExist = useCallback(
    async (mnemonic: string) => {
      if (!loginSessionRef.current) {
        throw new AppError(t('errors.loginSessionIsNotDefined'))
      }

      for (const wallet of walletsRef.current) {
        if (!wallet.encryptedMnemonic) continue

        const walletMnemonic = await window.api.sendAsync('encryption:decryptBasedEncryptedSecret', {
          value: wallet.encryptedMnemonic,
          encryptedSecret: loginSessionRef.current.encryptedPassword,
        })

        if (walletMnemonic === mnemonic) return true
      }

      return false
    },
    [loginSessionRef, t, walletsRef]
  )

  return { doesMnemonicExist }
}
