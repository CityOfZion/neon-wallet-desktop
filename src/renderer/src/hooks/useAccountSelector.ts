import { useCallback } from 'react'
import { AccountHelper } from '@renderer/helpers/AccountHelper'
import { SelectorHelper } from '@renderer/helpers/SelectorHelper'
import { TAccountHelperPredicateParams } from '@shared/@types/helpers'
import { TLoginSessionType } from '@shared/@types/store'

import { createAppSelector, useAppSelector } from './useRedux'

const selectAccounts = createAppSelector(
  [state => state.auth.data.applicationDataByLoginType, state => state.auth.currentLoginSession],
  (applicationDataByLoginType, currentLoginSession) => {
    if (!currentLoginSession) {
      throw new Error('You need to be logged in to access accounts')
    }

    return applicationDataByLoginType[currentLoginSession.type].wallets.flatMap(wallet => wallet.accounts)
  }
)

const selectHasHardwareAccount = createAppSelector(
  [state => state.auth.data.applicationDataByLoginType, state => state.auth.currentLoginSession],
  (applicationDataByLoginType, currentLoginSession) => {
    if (!currentLoginSession) {
      throw new Error('You need to be logged in to access accounts')
    }

    return applicationDataByLoginType[currentLoginSession.type].wallets.some(wallet =>
      wallet.accounts.some(account => account.type === 'hardware')
    )
  }
)

const selectAccountsByWalletId = (walletId: string) =>
  createAppSelector(
    [state => state.auth.data.applicationDataByLoginType, state => state.auth.currentLoginSession],
    (applicationDataByLoginType, currentLoginSession) => {
      if (!currentLoginSession) {
        throw new Error('You need to be logged in to access accounts')
      }

      const wallet = applicationDataByLoginType[currentLoginSession.type].wallets.find(wallet => wallet.id === walletId)

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

export const useAccountsSelectorLazy = () => {
  const { ref: applicationDataByLoginTypeRef } = useAppSelector(state => state.auth.data.applicationDataByLoginType)

  const getAccounts = useCallback(
    (loginSessionType: TLoginSessionType) => {
      return applicationDataByLoginTypeRef.current[loginSessionType].wallets.flatMap(wallet => wallet.accounts)
    },
    [applicationDataByLoginTypeRef]
  )

  return {
    getAccounts,
  }
}
