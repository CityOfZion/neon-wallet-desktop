import type { TBSServiceName } from '@cityofzion/bs-multichain'
import { CaseReducer, PayloadAction } from '@reduxjs/toolkit'

import { BlockchainServiceHelper } from '@renderer/helpers/BlockchainServiceHelper'

import { AppError } from '@shared/helpers/SharedErrorHelper'
import { SharedI18nextHelper } from '@shared/helpers/SharedI18nextHelper'
import type { TUseTransactionsTransaction } from '@shared/types/hooks'

import { TUtilityReducer } from './index'

type THiddenTokenParams = {
  hash: string
  blockchain: TBSServiceName
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

// Last Indexes By Wallet Reducers
const saveLastIndexByWallet: CaseReducer<
  TUtilityReducer,
  PayloadAction<{
    index: number
    firstAccountAddress: string
    blockchain: TBSServiceName
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
  const hiddenTokens = (state.data.hiddenTokensByBlockchain[blockchain] ||= [])
  const index = hiddenTokens.findIndex(tokenHash => service.tokenService.predicateByHash(normalizedHash, tokenHash))

  if (index < 0) {
    hiddenTokens.push(normalizedHash)
  } else {
    hiddenTokens.splice(index, 1)
  }
}

export const utilitySliceReducers = {
  addPendingTransaction,
  removePendingTransaction,
  saveLastIndexByWallet,
  toggleHiddenToken,
  setUnlockedSkinIds,
}
