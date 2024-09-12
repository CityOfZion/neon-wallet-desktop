import { BlockchainService, waitForTransaction } from '@cityofzion/blockchain-service'
import { CaseReducer, createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit'
import { ToastHelper } from '@renderer/helpers/ToastHelper'
import { UtilsHelper } from '@renderer/helpers/UtilsHelper'
import { buildQueryKeyBalance } from '@renderer/hooks/useBalances'
import { buildQueryKeyTokenTransfer, buildQueryKeyTokenTransferAggregate } from '@renderer/hooks/useTokenTransfers'
import { getI18next } from '@renderer/libs/i18next'
import { queryClient } from '@renderer/libs/query'
import { TBlockchainServiceKey, TNetwork } from '@shared/@types/blockchain'
import { TUseTransactionsTransfer } from '@shared/@types/hooks'
import { IAccountState } from '@shared/@types/store'
import { PURGE } from 'redux-persist'

export interface IAccountReducer {
  data: IAccountState[]
  pendingTransactions: TUseTransactionsTransfer[]
}

type TWatchPendingTransactionParams = {
  transaction: TUseTransactionsTransfer
  blockchainService: BlockchainService<TBlockchainServiceKey>
  network: TNetwork<TBlockchainServiceKey>
}

export const accountReducerName = 'accountReducer'

const initialState = {
  data: [],
  pendingTransactions: [],
} as IAccountReducer

const { t } = getI18next()

const saveAccount: CaseReducer<IAccountReducer, PayloadAction<IAccountState>> = (state, action) => {
  const account = action.payload

  const findIndex = state.data.findIndex(it => it.id === account.id)

  if (findIndex < 0) {
    state.data = [...state.data, account]
    return
  }

  state.data[findIndex] = account
}

const replaceAllAccounts: CaseReducer<IAccountReducer, PayloadAction<IAccountState[]>> = (state, action) => {
  state.data = action.payload
}

const reorderAccounts: CaseReducer<IAccountReducer, PayloadAction<string[]>> = (state, action) => {
  const accountsOrder = action.payload

  accountsOrder.forEach((id, index) => {
    const accountIndex = state.data.findIndex(it => it.id === id)
    if (accountIndex < 0) return

    state.data[accountIndex].order = index
  })
}

const deleteAccount: CaseReducer<IAccountReducer, PayloadAction<string>> = (state, action) => {
  const id = action.payload
  state.data = state.data.filter(account => account.id !== id)
}

const deleteAccounts: CaseReducer<IAccountReducer, PayloadAction<string[]>> = (state, action) => {
  const ids = action.payload
  state.data = state.data.filter(account => !ids.includes(account.id))
}

const addPendingTransaction: CaseReducer<IAccountReducer, PayloadAction<TUseTransactionsTransfer>> = (
  state,
  action
) => {
  state.pendingTransactions = [...state.pendingTransactions, action.payload]
}

const removeAllPendingTransactions: CaseReducer<IAccountReducer> = state => {
  state.pendingTransactions = []
}

const watchPendingTransaction = createAsyncThunk(
  'accounts/watchPendingTransaction',
  async ({ transaction, blockchainService, network }: TWatchPendingTransactionParams) => {
    const success = await waitForTransaction(blockchainService, transaction.hash)

    if (success) {
      // Temporary solution to wait for the transaction to be indexed, we need to improve waitForTransaction method
      await UtilsHelper.sleep(60000)
      ToastHelper.success({ message: t('pages:send.transactionCompleted') })

      queryClient.removeQueries({
        queryKey: buildQueryKeyTokenTransfer(transaction.account, network),
      })
      queryClient.removeQueries({
        queryKey: buildQueryKeyTokenTransferAggregate(),
      })
      queryClient.removeQueries({
        queryKey: buildQueryKeyBalance(transaction.account.address, transaction.account.blockchain, network),
        exact: true,
      })

      if (transaction.toAccount) {
        queryClient.removeQueries({
          queryKey: buildQueryKeyBalance(transaction.toAccount.address, transaction.toAccount.blockchain, network),
          exact: true,
        })
        queryClient.removeQueries({
          queryKey: buildQueryKeyTokenTransfer(transaction.toAccount, network),
        })
      }
    } else {
      ToastHelper.error({ message: t('pages:send.transactionFailed') })
    }

    return transaction.hash
  }
)

const AccountReducer = createSlice({
  name: accountReducerName,
  initialState,
  reducers: {
    deleteAccount,
    deleteAccounts,
    saveAccount,
    replaceAllAccounts,
    reorderAccounts,
    addPendingTransaction,
    removeAllPendingTransactions,
  },
  extraReducers(builder) {
    builder.addCase(PURGE, () => initialState)
    builder.addCase(watchPendingTransaction.fulfilled, (state, action) => {
      const transactionHash = action.payload
      state.pendingTransactions = state.pendingTransactions.filter(transaction => transaction.hash !== transactionHash)
    })
  },
})

export const accountReducerActions = {
  ...AccountReducer.actions,
  watchPendingTransaction,
}
export default AccountReducer.reducer
