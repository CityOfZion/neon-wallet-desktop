import { hasMigrationNeo3, waitForMigration } from '@cityofzion/blockchain-service'
import { createAsyncThunk } from '@reduxjs/toolkit'
import { ReactQueryHelper } from '@renderer/helpers/ReactQueryHelper'
import { TRootState } from '@renderer/hooks/useRedux'
import { bsAggregator } from '@renderer/libs/blockchainService'
import { TUseTransactionsTransfer } from '@shared/@types/hooks'
import { TSaveNotification } from '@shared/@types/store'
import { getI18next } from '@shared/libs/i18next'
import { match } from 'ts-pattern'

import { authReducerActions } from '../reducers/AuthReducer'

type TWaitMigrationWorkerParams = {
  hash: string
  transactionsTransfer: TUseTransactionsTransfer[]
  neo3Address: string
}

const { t } = getI18next()

export const waitMigration = createAsyncThunk<void, TWaitMigrationWorkerParams>(
  'waitMigration',
  async (params, { getState, dispatch }) => {
    const { hash, transactionsTransfer, neo3Address } = params
    const firstTransaction = transactionsTransfer[0]

    const state = getState() as TRootState
    const network = state.settings.data.selectedNetworkByBlockchain[firstTransaction.account.blockchain]

    const notification: TSaveNotification = {
      title: t('pages:migrationNeo3.failureNotification.previewBody'),
      previewBody: t('pages:migrationNeo3.failureNotification.previewBody'),
      related: {
        blockchain: firstTransaction.account.blockchain,
        address: firstTransaction.account.address,
      },
    }

    try {
      transactionsTransfer.forEach(transaction => dispatch(authReducerActions.addPendingTransaction(transaction)))

      const neo3Service = bsAggregator.blockchainServicesByName.neo3
      const service = bsAggregator.blockchainServicesByName[firstTransaction.account.blockchain]
      if (!hasMigrationNeo3(service)) throw new Error('Migration is not supported for this blockchain service')

      const response = await waitForMigration({ service, neo3Service, neo3Address, txId: hash })

      match(response)
        .with({ isTransactionConfirmed: false }, () => {
          notification.title = t('pages:migrationNeo3.failureNeoLegacyNotification.title')
          notification.previewBody = t('pages:migrationNeo3.failureNeoLegacyNotification.previewBody')
        })
        .with({ isNeo3TransactionConfirmed: false }, () => {
          notification.title = t('pages:migrationNeo3.failureNeo3Notification.title')
          notification.previewBody = t('pages:migrationNeo3.failureNeo3Notification.previewBody')
        })
        .otherwise(() => {
          notification.title = t('pages:migrationNeo3.successNotification.previewBody')
          notification.previewBody = t('pages:migrationNeo3.successNotification.previewBody')
          notification.action = {
            type: 'navigate',
            payload: {
              to: 'account-transaction',
              address: firstTransaction.account.address,
              blockchain: firstTransaction.account.blockchain,
            },
          }
        })
    } catch {
      /* empty */
    }

    ReactQueryHelper.invalidateTransactionQueries(firstTransaction, network)

    dispatch(authReducerActions.saveNotification(notification))
    dispatch(authReducerActions.removePendingTransaction(hash))
  }
)
