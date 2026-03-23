import { BlockchainServiceHelper } from '@renderer/helpers/BlockchainServiceHelper'

import { SharedAccountHelper } from '@shared/helpers/SharedAccountHelper'
import { IAccountState } from '@shared/types/store'

import { createAppSelector, useAppSelector } from './useRedux'

const selectHasClaimPendingTransaction = (account: IAccountState) =>
  createAppSelector([state => state.utility.memoryData.pendingTransactions], pendingTransactions => {
    return pendingTransactions.some(
      transaction => transaction.type === 'claim' && SharedAccountHelper.predicate(account)(transaction.account)
    )
  })

export const usePendingTransactionsSelector = () => {
  const { value, ref } = useAppSelector(state => state.utility.memoryData.pendingTransactions)

  return {
    pendingTransactions: value,
    pendingTransactionsRef: ref,
  }
}

export const useHasClaimPendingTransactionSelector = (account: IAccountState) => {
  const { ref, value } = useAppSelector(selectHasClaimPendingTransaction(account))

  return {
    hasClaimPendingTransaction: value,
    hasClaimPendingTransactionRef: ref,
  }
}

export const useSwapRecordsSelector = () => {
  const { ref, value } = useAppSelector(state => state.utility.data.swapRecords)

  return {
    swapRecords: value,
    swapRecordsRef: ref,
  }
}

export const useSwapRecordSelector = (hash: string) => {
  const { value: swapRecord, ref: swapRecordRef } = useAppSelector(({ utility }) =>
    utility.data.swapRecords.find(({ txFrom, account }) => {
      const service = account
        ? BlockchainServiceHelper.bsAggregator.blockchainServicesByName[account.blockchain]
        : undefined

      return !!txFrom && !!service && service.tokenService.predicateByHash(hash, txFrom)
    })
  )

  return { swapRecord, swapRecordRef }
}

export const useLastIndexesByWallet = () => {
  const { ref, value } = useAppSelector(state => state.utility.data.lastIndexesByWallet)

  return {
    lastIndexesByWallet: value,
    lastIndexesByWalletRef: ref,
  }
}

export const useHiddenTokensByBlockchainSelector = () => {
  const { ref, value } = useAppSelector(state => state.utility.data.hiddenTokensByBlockchain)

  return {
    hiddenTokensByBlockchain: value,
    hiddenTokensByBlockchainRef: ref,
  }
}

export const useUnlockedSkinIdsSelector = () => {
  const { ref, value } = useAppSelector(state => state.utility.data.unlockedSkinIds)

  return {
    unlockedSkinIds: value,
    unlockedSkinIdsRef: ref,
  }
}
