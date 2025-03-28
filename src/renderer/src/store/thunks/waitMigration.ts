import { BSNeoLegacy, BSNeoLegacyHelper } from '@cityofzion/bs-neo-legacy'
import { createAsyncThunk } from '@reduxjs/toolkit'
import { ReactQueryHelper } from '@renderer/helpers/ReactQueryHelper'
import { TRootState } from '@renderer/hooks/useRedux'
import { bsAggregator } from '@renderer/libs/blockchainService'
import { TBlockchainServiceKey } from '@shared/@types/blockchain'
import { TUseTransactionsTransfer } from '@shared/@types/hooks'
import { TMigrationNeo3, TPendingMigrationNeo3, TSaveNotification } from '@shared/@types/store'
import { getI18next } from '@shared/libs/i18next'
import { cloneDeep } from 'lodash'
import { match } from 'ts-pattern'

import { authReducerActions } from '../reducers/AuthReducer'
import { utilityReducerActions } from '../reducers/UtilityReducer'

type TWaitMigrationWorkerParams = {
  migrationTransfers: TUseTransactionsTransfer[]
  pendingMigrationNeo3: TPendingMigrationNeo3
}

const { t } = getI18next()

export const waitMigration = createAsyncThunk<void, TWaitMigrationWorkerParams>(
  'waitMigration',
  async (params, { getState, dispatch }) => {
    const { migrationTransfers, pendingMigrationNeo3 } = params
    const firstTransaction = migrationTransfers[0]

    const migrationNeo3 = cloneDeep<TMigrationNeo3>(pendingMigrationNeo3)

    const state = getState() as TRootState
    const network = state.settings.data.selectedNetworkByBlockchain[firstTransaction.account.blockchain]

    const notification: TSaveNotification = {
      title: t('pages:migrationNeo3.failureNotification.title'),
      previewBody: t('pages:migrationNeo3.failureNotification.previewBody'),
      related: {
        blockchain: firstTransaction.account.blockchain,
        address: firstTransaction.account.address,
      },
    }

    try {
      dispatch(utilityReducerActions.saveMigrationNeo3(migrationNeo3))
      migrationTransfers.forEach(transaction => dispatch(utilityReducerActions.addPendingTransaction(transaction)))

      migrationNeo3.status = 'failure'

      const neo3Service = bsAggregator.blockchainServicesByName.neo3
      const neoLegacyService = bsAggregator.blockchainServicesByName.neoLegacy as BSNeoLegacy<TBlockchainServiceKey>

      const response = await BSNeoLegacyHelper.waitForMigration({
        neoLegacyService,
        neo3Service,
        neo3Address: pendingMigrationNeo3.neo3Address,
        transactionHash: pendingMigrationNeo3.hash,
      })

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
          notification.title = t('pages:migrationNeo3.successNotification.title')
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

    dispatch(utilityReducerActions.saveMigrationNeo3(migrationNeo3))
    dispatch(authReducerActions.saveNotification(notification))
    dispatch(utilityReducerActions.removePendingTransaction(pendingMigrationNeo3.hash))
  }
)
