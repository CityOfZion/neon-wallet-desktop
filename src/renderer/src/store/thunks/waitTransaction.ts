import { waitForAccountTransaction } from '@cityofzion/blockchain-service'
import { createAsyncThunk } from '@reduxjs/toolkit'
import { ReactQueryHelper } from '@renderer/helpers/ReactQueryHelper'
import { TRootState } from '@renderer/hooks/useRedux'
import { bsAggregator } from '@renderer/libs/blockchainService'
import { TUseTransactionsTransfer } from '@shared/@types/hooks'
import { TNotification, TSaveNotification } from '@shared/@types/store'

import { authReducerActions } from '../reducers/AuthReducer'
import { utilityReducerActions } from '../reducers/UtilityReducer'

type TWaitTransactionParams = {
  transaction: TUseTransactionsTransfer
  successNotification: Pick<TNotification, 'title' | 'previewBody'>
  failureNotification: Pick<TNotification, 'title' | 'previewBody'>
}

export const waitTransaction = createAsyncThunk<void, TWaitTransactionParams>(
  'waitTransaction',
  async (params, { getState, dispatch }) => {
    const { transaction, successNotification, failureNotification } = params

    const state = getState() as TRootState
    const network = state.settings.data.selectedNetworkByBlockchain[transaction.account.blockchain]

    const notification: TSaveNotification = {
      title: failureNotification.title,
      previewBody: failureNotification.previewBody,
      related: {
        blockchain: transaction.account.blockchain,
        address: transaction.account.address,
      },
    }

    try {
      dispatch(utilityReducerActions.addPendingTransaction(transaction))

      const service = bsAggregator.blockchainServicesByName[transaction.account.blockchain]

      const response = await waitForAccountTransaction({
        service,
        txId: transaction.hash,
        address: transaction.account.address,
        maxAttempts: 20,
      })

      if (response) {
        notification.title = successNotification.title
        notification.previewBody = successNotification.previewBody
        notification.action = {
          type: 'navigate',
          payload: {
            to: 'account-transaction',
            address: transaction.account.address,
            blockchain: transaction.account.blockchain,
          },
        }
      }
    } catch {
      /* empty */
    }

    ReactQueryHelper.invalidateTransactionQueries(transaction.account, network, transaction.toAccount)

    dispatch(authReducerActions.saveNotification(notification))
    dispatch(utilityReducerActions.removePendingTransaction(transaction.hash))
  }
)
