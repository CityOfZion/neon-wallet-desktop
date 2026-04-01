import { CaseReducer, PayloadAction } from '@reduxjs/toolkit'
import { cloneDeep } from 'lodash'

import { BlockchainServiceHelper } from '@renderer/helpers/BlockchainServiceHelper'

import { AppError } from '@shared/helpers/SharedErrorHelper'
import { SharedI18nextHelper } from '@shared/helpers/SharedI18nextHelper'
import { TBlockchainServiceKey } from '@shared/types/blockchain'
import type { TUseTransactionsTransaction } from '@shared/types/hooks'
import { TSwapRecord } from '@shared/types/store'

import { TUtilityReducer } from './index'

type THiddenTokenParams = {
  hash: string
  blockchain: TBlockchainServiceKey
}

const { t } = SharedI18nextHelper.get()

// Pending Transaction Reducers
const addPendingTransaction: CaseReducer<TUtilityReducer, PayloadAction<TUseTransactionsTransaction>> = (
  state,
  action
) => {
  state.memoryData.pendingTransactions = [...state.memoryData.pendingTransactions, action.payload]
}

const removePendingTransaction: CaseReducer<TUtilityReducer, PayloadAction<string>> = (state, action) => {
  state.memoryData.pendingTransactions = state.memoryData.pendingTransactions.filter(
    transaction => transaction.txId !== action.payload
  )
}

// Swap Reducers
const persistSwapRecord: CaseReducer<TUtilityReducer, PayloadAction<TSwapRecord>> = (state, action) => {
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
  TUtilityReducer,
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
const setUnlockedSkinIds: CaseReducer<TUtilityReducer, PayloadAction<string[]>> = (state, action) => {
  const { payload: skinIds } = action

  state.data.unlockedSkinIds = skinIds
}

// Hidden Tokens Reducers
const toggleHiddenToken: CaseReducer<TUtilityReducer, PayloadAction<THiddenTokenParams>> = (state, action) => {
  const { hash, blockchain } = action.payload

  const service = BlockchainServiceHelper.bsAggregator.blockchainServicesByName[blockchain]

  if (service.tokenService.isNativeToken(hash)) {
    throw new AppError(t('errors.unexpectedError'))
  }

  const normalizedHash = service.tokenService.normalizeHash(hash)
  const hiddenTokens = cloneDeep(state.data.hiddenTokensByBlockchain[blockchain] || [])
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

export const utilitySliceReducers = {
  addPendingTransaction,
  removePendingTransaction,
  persistSwapRecord,
  saveLastIndexByWallet,
  toggleHiddenToken,
  setUnlockedSkinIds,
}
