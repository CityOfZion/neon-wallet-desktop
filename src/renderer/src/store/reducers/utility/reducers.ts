import { CaseReducer, PayloadAction } from '@reduxjs/toolkit'
import { cloneDeep } from 'lodash'

import { TokenHelper } from '@renderer/helpers/TokenHelper'

import { bsAggregator } from '@renderer/libs/blockchain-service'
import { TBlockchainServiceKey } from '@shared/types/blockchain'
import { TUseTransactionsTransfer } from '@shared/types/hooks'
import { TMigrationNeo3, TMigrationsNeo3, TSwapRecord } from '@shared/types/store'

import { IUtilityReducer } from './index'

type THiddenTokenParams = {
  hash: string
  blockchain: TBlockchainServiceKey
}

// Pending Transaction Reducers
const addPendingTransaction: CaseReducer<IUtilityReducer, PayloadAction<TUseTransactionsTransfer>> = (
  state,
  action
) => {
  state.inMemoryData.pendingTransactions = [...state.inMemoryData.pendingTransactions, action.payload]
}

const removePendingTransaction: CaseReducer<IUtilityReducer, PayloadAction<string>> = (state, action) => {
  state.inMemoryData.pendingTransactions = state.inMemoryData.pendingTransactions.filter(
    transaction => transaction.hash !== action.payload
  )
}

// Swap Reducers
const persistSwapRecord: CaseReducer<IUtilityReducer, PayloadAction<TSwapRecord>> = (state, action) => {
  const swapRecord = cloneDeep(action.payload)

  // We don't want to save this long information in the storage
  swapRecord.log = undefined

  const index = state.data.swapRecords.findIndex(
    it => it.swapId === swapRecord.swapId && it.swapProvider === swapRecord.swapProvider
  )

  if (index === -1) {
    state.data.swapRecords = [...state.data.swapRecords, swapRecord]
    return
  }

  state.data.swapRecords[index] = swapRecord
}

// Last Indexes By Wallet Reducers
const saveLastIndexByWallet: CaseReducer<
  IUtilityReducer,
  PayloadAction<{
    index: number
    firstAccountAddress: string
    blockchain: TBlockchainServiceKey
  }>
> = (state, action) => {
  const { firstAccountAddress, index, blockchain } = action.payload
  state.data.lastIndexesByWallet[blockchain] = {
    ...state.data.lastIndexesByWallet[blockchain],
    [firstAccountAddress]: index,
  }
}

// Unlocked Skins Reducers
const setUnlockedSkinIds: CaseReducer<IUtilityReducer, PayloadAction<string[]>> = (state, action) => {
  const { payload: skinIds } = action

  state.data.unlockedSkinIds = skinIds
}

// Hidden Tokens Reducers
const toggleHiddenToken: CaseReducer<IUtilityReducer, PayloadAction<THiddenTokenParams>> = (state, action) => {
  const { hash, blockchain } = action.payload

  if (TokenHelper.isNativeToken(hash, blockchain)) throw new Error("The native token can't be hidden")

  const service = bsAggregator.blockchainServicesByName[blockchain]
  const normalizedHash = service.tokenService.normalizeHash(hash)
  const hiddenTokens = cloneDeep(state.data.hiddenTokensByBlockchain[blockchain] ?? [])
  const index = hiddenTokens.findIndex(tokenHash => service.tokenService.predicateByHash(normalizedHash, tokenHash))

  if (index < 0) {
    hiddenTokens.push(normalizedHash)
  } else {
    hiddenTokens.splice(index, 1)
  }

  state.data.hiddenTokensByBlockchain = {
    ...state.data.hiddenTokensByBlockchain,
    [blockchain]: hiddenTokens,
  }
}

// Migration Neo3 Reducers
const saveMigrationNeo3: CaseReducer<IUtilityReducer, PayloadAction<TMigrationNeo3>> = (state, action) => {
  const migrationNeo3 = cloneDeep(action.payload)

  state.data.migrationsNeo3[migrationNeo3.hash] = migrationNeo3
}

const mergeMigrationsNeo3: CaseReducer<IUtilityReducer, PayloadAction<TMigrationsNeo3>> = (state, action) => {
  const migrationsNeo3 = cloneDeep(action.payload)

  state.data.migrationsNeo3 = { ...state.data.migrationsNeo3, ...migrationsNeo3 }
}

export const utilitySliceReducers = {
  addPendingTransaction,
  removePendingTransaction,
  persistSwapRecord,
  saveLastIndexByWallet,
  toggleHiddenToken,
  saveMigrationNeo3,
  mergeMigrationsNeo3,
  setUnlockedSkinIds,
}
