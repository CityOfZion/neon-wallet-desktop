import { waitForAccountTransaction } from '@cityofzion/blockchain-service'
import { createAsyncThunk } from '@reduxjs/toolkit'

import { BlockchainServiceHelper } from '@renderer/helpers/BlockchainServiceHelper'
import { ReactQueryHelper } from '@renderer/helpers/ReactQueryHelper'

import type { TRootState } from '@renderer/types/redux'
import type { TUseTransactionsTransaction } from '@shared/types/hooks'
import { TNotification, TSaveNotification } from '@shared/types/store'

import { authReducerActions } from '../reducers/auth'
import { utilityReducerActions } from '../reducers/utility'

type TWaitTransactionParams = {
  transaction: TUseTransactionsTransaction
  successNotification: Pick<TNotification, 'title' | 'previewBody'>
  failureNotification: Pick<TNotification, 'title' | 'previewBody'>
}

export const waitTransaction = createAsyncThunk<void, TWaitTransactionParams>(
  'waitTransaction',
  async (params, { getState, dispatch }) => {
    const { transaction, successNotification, failureNotification } = params

    const state = getState() as TRootState
    const network = state.settings.data.selectedNetworkProfile.networkByBlockchain[transaction.account.blockchain]

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

      const service = BlockchainServiceHelper.bsAggregator.blockchainServicesByName[transaction.account.blockchain]

      const response = await waitForAccountTransaction({
        service,
        txId: transaction.txId,
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

    ReactQueryHelper.invalidateTransactionQueries(transaction.account, network, transaction.account)

    dispatch(authReducerActions.saveNotification(notification))
    dispatch(utilityReducerActions.removePendingTransaction(transaction.txId))
  }
)
