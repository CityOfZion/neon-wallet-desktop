import { type RefObject, useCallback, useRef } from 'react'

import { useSelector } from 'react-redux'

import { SelectorHelper } from '@renderer/helpers/SelectorHelper'

import type { TRootState } from '@renderer/types/redux'
import { SharedAccountHelper } from '@shared/helpers/SharedAccountHelper'
import type { TBlockchainServiceKey } from '@shared/types/blockchain'
import type { TAccountHelperPredicateParams } from '@shared/types/helpers'
import type { IAccountState, TAccountWithWallet } from '@shared/types/store'

import { createAppSelector, useAppSelector } from './useRedux'

export const selectAccounts = createAppSelector(
  [state => state.auth.data.applicationDataByLoginType, state => state.auth.memoryData.loginSession],
  (applicationDataByLoginType, loginSession) => {
    if (!loginSession?.type) return SelectorHelper.fallbackToEmptyArray<IAccountState>()

    const accounts = applicationDataByLoginType[loginSession.type].wallets.flatMap(wallet => wallet.accounts)

    return SelectorHelper.fallbackToEmptyArray<IAccountState>(accounts)
  }
)

export const selectAccountsByBlockchains = (blockchains: TBlockchainServiceKey[]) =>
  createAppSelector(
    [state => state.auth.data.applicationDataByLoginType, state => state.auth.memoryData.loginSession],
    (applicationDataByLoginType, loginSession) => {
      if (!loginSession?.type) return SelectorHelper.fallbackToEmptyArray<IAccountState>()

      const accounts = applicationDataByLoginType[loginSession.type].wallets.flatMap(wallet =>
        wallet.accounts.filter(account => blockchains.some(blockchain => blockchain === account.blockchain))
      )

      return SelectorHelper.fallbackToEmptyArray<IAccountState>(accounts)
    }
  )

export const selectAccount = (params: TAccountHelperPredicateParams) =>
  createAppSelector(
    [state => state.auth.data.applicationDataByLoginType, state => state.auth.memoryData.loginSession],
    (applicationDataByLoginType, loginSession) => {
      if (!loginSession?.type) return undefined

      return applicationDataByLoginType[loginSession.type].wallets
        .flatMap(wallet => wallet.accounts)
        .find(SharedAccountHelper.predicate(params))
    }
  )

const selectOwnAccounts = createAppSelector(
  [state => state.auth.data.applicationDataByLoginType, state => state.auth.memoryData.loginSession],
  (applicationDataByLoginType, loginSession) => {
    if (!loginSession?.type) return SelectorHelper.fallbackToEmptyArray<IAccountState>()

    const accounts = applicationDataByLoginType[loginSession.type].wallets.flatMap(wallet =>
      wallet.accounts.filter(account => account.type !== 'watch' || wallet.type === 'hardware')
    )

    return SelectorHelper.fallbackToEmptyArray<IAccountState>(accounts)
  }
)

const selectHasHardwareAccount = createAppSelector(
  [state => state.auth.data.applicationDataByLoginType, state => state.auth.memoryData.loginSession],
  (applicationDataByLoginType, loginSession) => {
    if (!loginSession?.type) return false

    return applicationDataByLoginType[loginSession.type].wallets.some(wallet =>
      wallet.accounts.some(account => account.type === 'hardware')
    )
  }
)

const selectAccountsWithWallet = createAppSelector(
  [state => state.auth.data.applicationDataByLoginType, state => state.auth.memoryData.loginSession],
  (applicationDataByLoginType, loginSession) => {
    if (!loginSession?.type) return SelectorHelper.fallbackToEmptyArray<TAccountWithWallet>()

    const accountsWithWallet = applicationDataByLoginType[loginSession.type].wallets.flatMap(wallet =>
      wallet.accounts.map<TAccountWithWallet>(account => ({ ...account, wallet }))
    )

    return SelectorHelper.fallbackToEmptyArray<TAccountWithWallet>(accountsWithWallet)
  }
)

const selectAccountsByWalletId = (walletId: string) =>
  createAppSelector(
    [state => state.auth.data.applicationDataByLoginType, state => state.auth.memoryData.loginSession],
    (applicationDataByLoginType, loginSession) => {
      if (!loginSession?.type) return SelectorHelper.fallbackToEmptyArray<IAccountState>()

      const wallet = applicationDataByLoginType[loginSession.type].wallets.find(wallet => wallet.id === walletId)

      return SelectorHelper.fallbackToEmptyArray<IAccountState>(wallet?.accounts)
    }
  )

export const useAccountsSelector = () => {
  const { value, ref } = useAppSelector(selectAccounts)

  return { accounts: value, accountsRef: ref }
}

export const useAccountsByBlockchainsSelector = (blockchains: TBlockchainServiceKey[]) => {
  const { value: accountsByBlockchains, ref: accountsByBlockchainsRef } = useAppSelector(
    selectAccountsByBlockchains(blockchains)
  )

  return { accountsByBlockchains, accountsByBlockchainsRef }
}

export const useAccountSelector = (params: TAccountHelperPredicateParams) => {
  const { value, ref } = useAppSelector(selectAccount(params))

  return { account: value, accountRef: ref }
}

export const useOwnAccountsSelector = () => {
  const { value: ownAccounts, ref: ownAccountsRef } = useAppSelector(selectOwnAccounts)

  return { ownAccounts, ownAccountsRef }
}

export const useAccountsByWalletIdSelector = (walletId: string) => {
  const { value, ref } = useAppSelector(selectAccountsByWalletId(walletId))

  return { accountsByWalletId: value, accountsByWalletIdRef: ref }
}

export const useAccountsWithWalletSelector = () => {
  const { value, ref } = useAppSelector(selectAccountsWithWallet)

  return { accountsWithWallet: value, accountsWithWalletRef: ref }
}

export const useHasHardwareAccountSelector = () => {
  const selector: { value: boolean; ref: RefObject<boolean> } = useAppSelector(selectHasHardwareAccount)

  return { hasHardwareAccount: selector.value, hasHardwareAccountRef: selector.ref }
}

export const useAccountsWithWalletMapSelector = () => {
  const accountsWithWalletMapRef = useRef(new Map<string, TAccountWithWallet>())

  useSelector((state: TRootState) => {
    const result = selectAccountsWithWallet(state)

    accountsWithWalletMapRef.current.clear()

    result.forEach(account => {
      accountsWithWalletMapRef.current.set(SharedAccountHelper.buildAccountKey(account), account)
    })
  })

  return { accountsWithWalletMapRef }
}

export const useAccountsMapSelector = () => {
  const accountsMapRef = useRef(new Map<string, IAccountState>())

  useSelector((state: TRootState) => {
    const result = selectAccounts(state)

    accountsMapRef.current.clear()

    result.forEach(account => {
      accountsMapRef.current.set(SharedAccountHelper.buildAccountKey(account), account)
    })
  })

  return { accountsMapRef }
}

export const useAccountUtils = () => {
  const { accountsMapRef } = useAccountsMapSelector()

  const doesAccountExist = useCallback(
    (params: TAccountHelperPredicateParams) => accountsMapRef.current.has(SharedAccountHelper.buildAccountKey(params)),
    [accountsMapRef]
  )

  return { doesAccountExist }
}
