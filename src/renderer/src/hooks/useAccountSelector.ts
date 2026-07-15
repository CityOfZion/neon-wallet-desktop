import { type RefObject, useCallback } from 'react'

import { SelectorHelper } from '@renderer/helpers/SelectorHelper'

import { SharedAccountHelper } from '@shared/helpers/SharedAccountHelper'
import type { TBlockchainServiceKey } from '@shared/types/blockchain'
import type { TAccountHelperPredicateParams } from '@shared/types/helpers'
import type { TAccount, TAccountWithWallet } from '@shared/types/store'

import { createAppSelector, useAppSelector } from './useRedux'

export const selectAccounts = createAppSelector(
  [state => state.auth.data.applicationDataByLoginType, state => state.auth.memoryData.loginSession],
  (applicationDataByLoginType, loginSession) => {
    if (!loginSession?.type) return SelectorHelper.fallbackToEmptyArray<TAccount>()

    const accounts = applicationDataByLoginType[loginSession.type].wallets.flatMap(wallet => wallet.accounts)

    return SelectorHelper.fallbackToEmptyArray<TAccount>(accounts)
  }
)

export const selectAccountsByBlockchains = (blockchains: TBlockchainServiceKey[]) =>
  createAppSelector(
    [state => state.auth.data.applicationDataByLoginType, state => state.auth.memoryData.loginSession],
    (applicationDataByLoginType, loginSession) => {
      if (!loginSession?.type) return SelectorHelper.fallbackToEmptyArray<TAccount>()

      const accounts = applicationDataByLoginType[loginSession.type].wallets.flatMap(wallet =>
        wallet.accounts.filter(account => blockchains.some(blockchain => blockchain === account.blockchain))
      )

      return SelectorHelper.fallbackToEmptyArray<TAccount>(accounts)
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
    if (!loginSession?.type) return SelectorHelper.fallbackToEmptyArray<TAccount>()

    const accounts = applicationDataByLoginType[loginSession.type].wallets.flatMap(wallet =>
      wallet.accounts.filter(account => account.type !== 'watch' || wallet.type === 'hardware')
    )

    return SelectorHelper.fallbackToEmptyArray<TAccount>(accounts)
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
      if (!loginSession?.type) return SelectorHelper.fallbackToEmptyArray<TAccount>()

      const wallet = applicationDataByLoginType[loginSession.type].wallets.find(wallet => wallet.id === walletId)

      return SelectorHelper.fallbackToEmptyArray<TAccount>(wallet?.accounts)
    }
  )

const selectAccountsWithWalletMap = createAppSelector([selectAccountsWithWallet], accountsWithWallet => {
  const map = new Map<string, TAccountWithWallet>()
  accountsWithWallet.forEach(account => {
    map.set(SharedAccountHelper.buildAccountKey(account), account)
  })
  return map
})

const selectAccountsMap = createAppSelector([selectAccounts], accounts => {
  const map = new Map<string, TAccount>()
  accounts.forEach(account => {
    map.set(SharedAccountHelper.buildAccountKey(account), account)
  })
  return map
})

const selectOwnAccountsMap = createAppSelector([selectOwnAccounts], accounts => {
  const map = new Map<string, TAccount>()

  accounts.forEach(account => {
    map.set(SharedAccountHelper.buildAccountKey(account), account)
  })

  return map
})

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
  const { ref: accountsWithWalletMapRef, value: accountsWithWalletMap } = useAppSelector(selectAccountsWithWalletMap)

  return { accountsWithWalletMapRef, accountsWithWalletMap }
}

export const useOwnAccountsMapSelector = () => {
  const { value: ownAccountsMap, ref: ownAccountsMapRef } = useAppSelector(selectOwnAccountsMap)

  return { ownAccountsMap, ownAccountsMapRef }
}

export const useAccountsMapSelector = () => {
  const { ref: accountsMapRef, value: accountsMap } = useAppSelector(selectAccountsMap)

  return { accountsMapRef, accountsMap }
}

export const useAccountUtils = () => {
  const { accountsMapRef } = useAccountsMapSelector()

  const doesAccountExist = useCallback(
    (params: TAccountHelperPredicateParams) => accountsMapRef.current.has(SharedAccountHelper.buildAccountKey(params)),
    [accountsMapRef]
  )

  return { doesAccountExist }
}
