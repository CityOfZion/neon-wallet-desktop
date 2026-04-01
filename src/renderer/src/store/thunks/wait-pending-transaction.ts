import { waitForAccountTransaction } from '@cityofzion/blockchain-service'
import { createAsyncThunk } from '@reduxjs/toolkit'

import { BlockchainServiceHelper } from '@renderer/helpers/BlockchainServiceHelper'
import { ReactQueryHelper } from '@renderer/helpers/ReactQueryHelper'

import type { TRootState } from '@renderer/types/redux'
import type { TUseTransactionsTransaction } from '@shared/types/hooks'
import { TNotification, TSaveNotification } from '@shared/types/store'

import { authReducerActions } from '../reducers/auth'
import { utilityReducerActions } from '../reducers/utility'

type TParams = {
  pendingTransaction: TUseTransactionsTransaction
  successNotification?: Pick<TNotification, 'title' | 'previewBody'>
  failureNotification?: Pick<TNotification, 'title' | 'previewBody'>
}

export const waitPendingTransaction = createAsyncThunk<void, TParams>(
  'waitPendingTransaction',
  async (params, { getState, dispatch }) => {
    const state = getState() as TRootState
    const { pendingTransaction, successNotification, failureNotification } = params
    const { txId, account } = pendingTransaction
    const { address, blockchain } = account
    const network = state.settings.data.selectedNetworkProfile.networkByBlockchain[blockchain]
    const hasNotifications = !!successNotification && !!failureNotification

    let notification: TSaveNotification | undefined

    if (hasNotifications) {
      notification = {
        title: failureNotification.title,
        previewBody: failureNotification.previewBody,
        related: { address, blockchain },
      }
    }

    try {
      dispatch(utilityReducerActions.addPendingTransaction(pendingTransaction))

      const service = BlockchainServiceHelper.bsAggregator.blockchainServicesByName[blockchain]
      const isCompleted = await waitForAccountTransaction({ service, txId, address, maxAttempts: 20 })

      if (isCompleted && notification && hasNotifications) {
        notification.title = successNotification.title
        notification.previewBody = successNotification.previewBody
        notification.action = {
          type: 'navigate',
          payload: {
            to: 'account-transaction',
            address,
            blockchain,
          },
        }
      }
    } catch {
      /* empty */
    }

    ReactQueryHelper.invalidateTransactionQueries(account, network)

    if (notification) dispatch(authReducerActions.saveNotification(notification))

    dispatch(utilityReducerActions.removePendingTransaction(txId))
  }
)
