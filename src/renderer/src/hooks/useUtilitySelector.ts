import { isClaimable } from '@cityofzion/blockchain-service'

import { BlockchainServiceHelper } from '@renderer/helpers/BlockchainServiceHelper'

import { SharedAccountHelper } from '@shared/helpers/SharedAccountHelper'
import { TAccount } from '@shared/types/store'

import { createAppSelector, useAppSelector } from './useRedux'

const selectHasClaimPendingTransaction = (account: TAccount) =>
  createAppSelector([state => state.utility.memoryData.pendingTransactions], pendingTransactions => {
    const service = BlockchainServiceHelper.bsAggregator.blockchainServicesByName[account.blockchain]

    return pendingTransactions.some(
      transaction =>
        isClaimable(service) &&
        service.claimService.getTransactionData(transaction) &&
        SharedAccountHelper.predicate(account)({
          blockchain: transaction.blockchain,
          address: transaction.relatedAddress!,
        })
    )
  })

export const usePendingTransactionsSelector = () => {
  const { value, ref } = useAppSelector(state => state.utility.memoryData.pendingTransactions)

  return {
    pendingTransactions: value,
    pendingTransactionsRef: ref,
  }
}

export const useHasClaimPendingTransactionSelector = (account: TAccount) => {
  const { value, ref } = useAppSelector(selectHasClaimPendingTransaction(account))

  return {
    hasClaimPendingTransaction: value,
    hasClaimPendingTransactionRef: ref,
  }
}

export const useSwapRecordsSelector = () => {
  const { value, ref } = useAppSelector(state => state.utility.data.swapRecords)

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
  const { value, ref } = useAppSelector(state => state.utility.data.lastIndexesByWallet)

  return {
    lastIndexesByWallet: value,
    lastIndexesByWalletRef: ref,
  }
}

export const useHiddenTokensByBlockchainSelector = () => {
  const { value, ref } = useAppSelector(state => state.utility.data.hiddenTokensByBlockchain)

  return {
    hiddenTokensByBlockchain: value,
    hiddenTokensByBlockchainRef: ref,
  }
}

export const useUnlockedSkinIdsSelector = () => {
  const { value, ref } = useAppSelector(state => state.utility.data.unlockedSkinIds)

  return {
    unlockedSkinIds: value,
    unlockedSkinIdsRef: ref,
  }
}
