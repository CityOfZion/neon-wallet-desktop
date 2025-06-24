import { BSTokenHelper } from '@cityofzion/blockchain-service'
import { IAccountState } from '@shared/@types/store'
import { SharedAccountHelper } from '@shared/helpers/SharedAccountHelper'

import { createAppSelector, useAppSelector } from './useRedux'

const selectHasClaimPendingTransaction = (account: IAccountState) =>
  createAppSelector([state => state.utility.inMemoryData.pendingTransactions], pendingTransactions => {
    return pendingTransactions.some(
      transaction => !!transaction.isClaim && SharedAccountHelper.predicate(account)(transaction.account)
    )
  })

const selectHasMigratePendingTransaction = (account: IAccountState) =>
  createAppSelector([state => state.utility.inMemoryData.pendingTransactions], pendingTransactions => {
    return pendingTransactions.some(
      transaction => !!transaction.isMigrate && SharedAccountHelper.predicate(account)(transaction.account)
    )
  })

export const usePendingTransactionsSelector = () => {
  const { ref, value } = useAppSelector(state => state.utility.inMemoryData.pendingTransactions)

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

export const useHasMigratePendingTransactionSelector = (account: IAccountState) => {
  const { ref, value } = useAppSelector(selectHasMigratePendingTransaction(account))
  return {
    hasMigratePendingTransaction: value,
    hasMigratePendingTransactionRef: ref,
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
  const normalizedHash = BSTokenHelper.normalizeHash(hash)

  const { value: swapRecord, ref: swapRecordRef } = useAppSelector(({ utility }) =>
    utility.data.swapRecords.find(({ txFrom }) => !!txFrom && BSTokenHelper.normalizeHash(txFrom) === normalizedHash)
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

export const useMigrationsNeo3Selector = () => {
  const { value: migrationsNeo3, ref: migrationsNeo3Ref } = useAppSelector(state => state.utility.data.migrationsNeo3)

  return { migrationsNeo3, migrationsNeo3Ref }
}

export const useMigrationNeo3Selector = (hash: string) => {
  const { value: migrationNeo3, ref: migrationNeo3Ref } = useAppSelector(
    ({ utility }) => utility.data.migrationsNeo3[BSTokenHelper.normalizeHash(hash)]
  )

  return { migrationNeo3, migrationNeo3Ref }
}

export const useUnlockedSkinIdsSelector = () => {
  const { ref, value } = useAppSelector(state => state.utility.data.unlockedSkinIds)

  return {
    unlockedSkinIds: value,
    unlockedSkinIdsRef: ref,
  }
}
