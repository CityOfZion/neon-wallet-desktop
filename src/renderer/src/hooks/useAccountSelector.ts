import { MutableRefObject, useCallback } from 'react'
import { AccountHelper } from '@renderer/helpers/AccountHelper'
import { SelectorHelper } from '@renderer/helpers/SelectorHelper'
import { TAccountHelperPredicateParams } from '@shared/@types/helpers'

import { createAppSelector, useAppSelector } from './useRedux'

const selectAccounts = createAppSelector(
  [state => state.auth.data.applicationDataByLoginType, state => state.auth.currentLoginSession],
  (applicationDataByLoginType, currentLoginSession) => {
    return applicationDataByLoginType[currentLoginSession?.type ?? 'password'].wallets.flatMap(
      wallet => wallet.accounts
    )
  }
)

const selectOwnAccounts = createAppSelector(
  [state => state.auth.data.applicationDataByLoginType, state => state.auth.currentLoginSession],
  (applicationDataByLoginType, currentLoginSession) => {
    return applicationDataByLoginType[currentLoginSession?.type ?? 'password'].wallets
      .flatMap(wallet => wallet.accounts)
      .filter(account => account.type !== 'watch')
  }
)

const selectHasHardwareAccount = createAppSelector(
  [state => state.auth.data.applicationDataByLoginType, state => state.auth.currentLoginSession],
  (applicationDataByLoginType, currentLoginSession) => {
    return applicationDataByLoginType[currentLoginSession?.type ?? 'password'].wallets.some(wallet =>
      wallet.accounts.some(account => account.type === 'hardware')
    )
  }
)

const selectAccountsWithWallet = createAppSelector(
  [state => state.auth.data.applicationDataByLoginType, state => state.auth.currentLoginSession],
  (applicationDataByLoginType, currentLoginSession) => {
    return applicationDataByLoginType[currentLoginSession?.type ?? 'password'].wallets.flatMap(wallet =>
      wallet.accounts.map(account => ({ ...account, wallet }))
    )
  }
)

const selectAccountsByWalletId = (walletId: string) =>
  createAppSelector(
    [state => state.auth.data.applicationDataByLoginType, state => state.auth.currentLoginSession],
    (applicationDataByLoginType, currentLoginSession) => {
      const wallet = applicationDataByLoginType[currentLoginSession?.type ?? 'password'].wallets.find(
        wallet => wallet.id === walletId
      )!

      return SelectorHelper.fallbackToEmptyArray(wallet?.accounts)
    }
  )

export const useAccountsSelector = () => {
  const { ref, value } = useAppSelector(selectAccounts)

  return {
    accounts: value,
    accountsRef: ref,
  }
}

export const useOwnAccountsSelector = () => {
  const { value: ownAccounts, ref: ownAccountsRef } = useAppSelector(selectOwnAccounts)

  return {
    ownAccounts,
    ownAccountsRef,
  }
}

export const useAccountsByWalletIdSelector = (walletId: string) => {
  const { ref, value } = useAppSelector(selectAccountsByWalletId(walletId))

  return {
    accountsByWalletId: value,
    accountsByWalletIdRef: ref,
  }
}

export const useAccountsWithWalletSelector = () => {
  const { ref, value } = useAppSelector(selectAccountsWithWallet)

  return {
    accountsWithWallet: value,
    accountsWithWalletRef: ref,
  }
}

export const useHasHardwareAccountSelector = () => {
  const selector: { value: boolean; ref: MutableRefObject<boolean> } = useAppSelector(selectHasHardwareAccount)

  return {
    hasHardwareAccount: selector.value,
    hasHardwareAccountRef: selector.ref,
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
