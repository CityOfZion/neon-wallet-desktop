import { hasMigrationNeo3, waitForMigration } from '@cityofzion/blockchain-service'
import { createAsyncThunk } from '@reduxjs/toolkit'
import { ReactQueryHelper } from '@renderer/helpers/ReactQueryHelper'
import { TRootState } from '@renderer/hooks/useRedux'
import { bsAggregator } from '@renderer/libs/blockchainService'
import { migrationNeo3ReducerActions } from '@renderer/store/reducers/MigrationNeo3Reducer'
import { TUseTransactionsTransfer } from '@shared/@types/hooks'
import { TMigrationNeo3, TPendingMigrationNeo3, TSaveNotification } from '@shared/@types/store'
import { getI18next } from '@shared/libs/i18next'
import { cloneDeep } from 'lodash'
import { match } from 'ts-pattern'

import { authReducerActions } from '../reducers/AuthReducer'

type TWaitMigrationWorkerParams = {
  hash: string
  transactionsTransfer: TUseTransactionsTransfer[]
  neo3Address: string
  pendingMigrationNeo3: TPendingMigrationNeo3
}

const { t } = getI18next()

export const waitMigration = createAsyncThunk<void, TWaitMigrationWorkerParams>(
  'waitMigration',
  async (params, { getState, dispatch }) => {
    const { hash, transactionsTransfer, neo3Address } = params
    const firstTransaction = transactionsTransfer[0]

    const migrationNeo3 = cloneDeep<TMigrationNeo3>(params.pendingMigrationNeo3)

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
      dispatch(migrationNeo3ReducerActions.saveMigrationNeo3(migrationNeo3))

      transactionsTransfer.forEach(transaction => dispatch(authReducerActions.addPendingTransaction(transaction)))

      migrationNeo3.status = 'failure'

      const neo3Service = bsAggregator.blockchainServicesByName.neo3
      const service = bsAggregator.blockchainServicesByName[firstTransaction.account.blockchain]

      if (!hasMigrationNeo3(service)) {
        dispatch(migrationNeo3ReducerActions.saveMigrationNeo3(migrationNeo3))

        throw new Error('Migration is not supported for this blockchain service')
      }

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
          migrationNeo3.status = 'done'
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

    dispatch(migrationNeo3ReducerActions.saveMigrationNeo3(migrationNeo3))
    dispatch(authReducerActions.saveNotification(notification))
    dispatch(authReducerActions.removePendingTransaction(hash))
  }
)
