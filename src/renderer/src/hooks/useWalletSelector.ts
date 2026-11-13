import { useRef } from 'react'

import { useSelector } from 'react-redux'

import { AccountHelper } from '@renderer/helpers/AccountHelper'
import { SelectorHelper } from '@renderer/helpers/SelectorHelper'

import type { TRootState } from '@renderer/types/redux'
import type { TWallet } from '@shared/types/store'

import { createAppSelector, useAppSelector } from './useRedux'

const selectWallets = createAppSelector(
  [state => state.auth.data.applicationDataByLoginType, state => state.auth.memoryData.loginSession],
  (applicationDataByLoginType, loginSession) => {
    if (!loginSession?.type) return SelectorHelper.fallbackToEmptyArray<TWallet>()

    return SelectorHelper.fallbackToEmptyArray<TWallet>(
      applicationDataByLoginType[loginSession.type].wallets.map(wallet => ({
        ...wallet,
        accounts: AccountHelper.orderAccounts(wallet.accounts),
      }))
    )
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
