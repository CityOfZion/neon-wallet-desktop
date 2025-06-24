import { MutableRefObject, useCallback, useRef } from 'react'
import { useSelector } from 'react-redux'
import { SelectorHelper } from '@renderer/helpers/SelectorHelper'
import { TBlockchainServiceKey } from '@shared/@types/blockchain'
import { TAccountHelperPredicateParams } from '@shared/@types/helpers'
import { IAccountState, TAccountWithWallet } from '@shared/@types/store'
import { SharedAccountHelper } from '@shared/helpers/SharedAccountHelper'

import { createAppSelector, TRootState, useAppSelector } from './useRedux'

export const selectAccounts = createAppSelector(
  [state => state.auth.data.applicationDataByLoginType, state => state.auth.inMemoryData.currentLoginSession],
  (applicationDataByLoginType, currentLoginSession) => {
    return applicationDataByLoginType[currentLoginSession?.type ?? 'password'].wallets.flatMap(
      wallet => wallet.accounts
    )
  }
)

export const selectAccountsByBlockchains = (blockchains: TBlockchainServiceKey[]) =>
  createAppSelector(
    [state => state.auth.data.applicationDataByLoginType, state => state.auth.inMemoryData.currentLoginSession],
    (applicationDataByLoginType, currentLoginSession) =>
      applicationDataByLoginType[currentLoginSession?.type ?? 'password'].wallets
        .flatMap(wallet => wallet.accounts)
        .filter(account => blockchains.some(blockchain => blockchain === account.blockchain))
  )

export const selectAccount = (params: TAccountHelperPredicateParams) =>
  createAppSelector(
    [state => state.auth.data.applicationDataByLoginType, state => state.auth.inMemoryData.currentLoginSession],
    (applicationDataByLoginType, currentLoginSession) => {
      return applicationDataByLoginType[currentLoginSession?.type ?? 'password'].wallets
        .flatMap(wallet => wallet.accounts)
        .find(SharedAccountHelper.predicate(params))
    }
  )

const selectOwnAccounts = createAppSelector(
  [state => state.auth.data.applicationDataByLoginType, state => state.auth.inMemoryData.currentLoginSession],
  (applicationDataByLoginType, currentLoginSession) => {
    const accounts: IAccountState[] = []

    applicationDataByLoginType[currentLoginSession?.type ?? 'password'].wallets.forEach(wallet =>
      wallet.accounts.forEach(account => {
        if (account.type === 'watch' && wallet.type !== 'hardware') return

        accounts.push(account)
      })
    )

    return accounts
  }
)

const selectHasHardwareAccount = createAppSelector(
  [state => state.auth.data.applicationDataByLoginType, state => state.auth.inMemoryData.currentLoginSession],
  (applicationDataByLoginType, currentLoginSession) => {
    return applicationDataByLoginType[currentLoginSession?.type ?? 'password'].wallets.some(wallet =>
      wallet.accounts.some(account => account.type === 'hardware')
    )
  }
)

const selectAccountsWithWallet = createAppSelector(
  [state => state.auth.data.applicationDataByLoginType, state => state.auth.inMemoryData.currentLoginSession],
  (applicationDataByLoginType, currentLoginSession) => {
    return applicationDataByLoginType[currentLoginSession?.type ?? 'password'].wallets.flatMap(wallet =>
      wallet.accounts.map<TAccountWithWallet>(account => ({ ...account, wallet }))
    )
  }
)

const selectAccountsByWalletId = (walletId: string) =>
  createAppSelector(
    [state => state.auth.data.applicationDataByLoginType, state => state.auth.inMemoryData.currentLoginSession],
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

export const useAccountsByBlockchainsSelector = (blockchains: TBlockchainServiceKey[]) => {
  const { value: accountsByBlockchains, ref: accountsByBlockchainsRef } = useAppSelector(
    selectAccountsByBlockchains(blockchains)
  )

  return { accountsByBlockchains, accountsByBlockchainsRef }
}

export const useAccountSelector = (account: TAccountHelperPredicateParams) => {
  const { ref, value } = useAppSelector(selectAccount(account))

  return {
    account: value,
    accountRef: ref,
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

export const useAccountMapSelector = () => {
  const accountsMapRef = useRef<Map<string, TAccountWithWallet>>() as MutableRefObject<Map<string, TAccountWithWallet>>

  useSelector((state: TRootState) => {
    const result = selectAccountsWithWallet(state)
    accountsMapRef.current = new Map<string, TAccountWithWallet>()
    result.forEach(account => {
      accountsMapRef.current.set(SharedAccountHelper.buildAccountKey(account), account)
    })
  })

  return {
    accountsMapRef,
  }
}

export const useAccountUtils = () => {
  const { accountsMapRef } = useAccountMapSelector()

  const doesAccountExist = useCallback(
    (params: TAccountHelperPredicateParams) => accountsMapRef.current.has(SharedAccountHelper.buildAccountKey(params)),
    [accountsMapRef]
  )

  return {
    doesAccountExist,
  }
}
