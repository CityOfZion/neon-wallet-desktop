import { useCallback } from 'react'
import { AccountHelper } from '@renderer/helpers/AccountHelper'
import { SelectorHelper } from '@renderer/helpers/SelectorHelper'
import { TAccountHelperPredicateParams } from '@shared/@types/helpers'
import { IAccountState } from '@shared/@types/store'

import { createAppSelector, useAppSelector } from './useRedux'

const filterAccountsByWalletId = (accounts: IAccountState[], walletId: string) =>
  accounts.filter(({ idWallet }) => idWallet === walletId)

const selectAccounts = createAppSelector(
  [state => state.auth.data.applicationDataByLoginType, state => state.auth.currentLoginSession],
  (applicationDataByLoginType, currentLoginSession) => {
    return applicationDataByLoginType[currentLoginSession?.type ?? 'password'].wallets.flatMap(wallet =>
      filterAccountsByWalletId(wallet.accounts, wallet.id)
    )
  }
)

const selectHasHardwareAccount = createAppSelector(
  [state => state.auth.data.applicationDataByLoginType, state => state.auth.currentLoginSession],
  (applicationDataByLoginType, currentLoginSession) => {
    return applicationDataByLoginType[currentLoginSession?.type ?? 'password'].wallets.some(wallet =>
      filterAccountsByWalletId(wallet.accounts, wallet.id).some(account => account.type === 'hardware')
    )
  }
)

const selectAccountsByWalletId = (walletId: string) =>
  createAppSelector(
    [state => state.auth.data.applicationDataByLoginType, state => state.auth.currentLoginSession],
    (applicationDataByLoginType, currentLoginSession) => {
      const wallet = applicationDataByLoginType[currentLoginSession?.type ?? 'password'].wallets.find(
        wallet => wallet.id === walletId
      )

      return filterAccountsByWalletId(SelectorHelper.fallbackToEmptyArray(wallet?.accounts), wallet?.id)
    }
  )

export const useAccountsSelector = () => {
  const { ref, value } = useAppSelector(selectAccounts)

  return {
    accounts: value,
    accountsRef: ref,
  }
}

export const useAccountsByWalletIdSelector = (walletId: string) => {
  const { ref, value } = useAppSelector(selectAccountsByWalletId(walletId))

  return {
    accountsByWalletId: value,
    accountsByWalletIdRef: ref,
  }
}

export const useHasHardwareAccountSelector = () => {
  const { ref, value } = useAppSelector(selectHasHardwareAccount)

  return {
    hasHardwareAccount: value,
    hasHardwareAccountRef: ref,
  }
}

export const useAccountUtils = () => {
  const { accountsRef } = useAccountsSelector()

  const doesAccountExist = useCallback(
    (params: TAccountHelperPredicateParams) => accountsRef.current.some(AccountHelper.predicate(params)),
    [accountsRef]
  )

  return {
    doesAccountExist,
  }
}
