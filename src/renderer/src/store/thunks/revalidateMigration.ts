import { hasMigrationNeo3, waitForMigration } from '@cityofzion/blockchain-service'
import { createAsyncThunk } from '@reduxjs/toolkit'
import { bsAggregator } from '@renderer/libs/blockchainService'
import { TFailureMigrationNeo3, TMigrationNeo3, TSaveNotification } from '@shared/@types/store'
import { getI18next } from '@shared/libs/i18next'
import { cloneDeep } from 'lodash'
import { match } from 'ts-pattern'

import { authReducerActions } from '../reducers/AuthReducer'
import { utilityReducerActions } from '../reducers/UtilityReducer'

type TRevalidateMigrationWorkerParams = {
  failureMigrationNeo3: TFailureMigrationNeo3
}

const { t } = getI18next()

export const revalidateMigration = createAsyncThunk<void, TRevalidateMigrationWorkerParams>(
  'revalidateMigration',
  async ({ failureMigrationNeo3 }, { dispatch }) => {
    const texts = t('pages:migrationNeo3', { returnObjects: true })
    const migrationNeo3 = cloneDeep<TMigrationNeo3>(failureMigrationNeo3)

    const notification: TSaveNotification = {
      title: texts.failureRevalidateNotification.title,
      previewBody: texts.failureRevalidateNotification.previewBody,
      related: { blockchain: migrationNeo3.account.blockchain, address: migrationNeo3.account.address },
    }

    try {
      migrationNeo3.status = 'pending'

      dispatch(utilityReducerActions.saveMigrationNeo3(migrationNeo3))

      migrationNeo3.status = 'failure'

      const service = bsAggregator.blockchainServicesByName[migrationNeo3.account.blockchain]
      const neo3Service = bsAggregator.blockchainServicesByName.neo3

      if (!hasMigrationNeo3(service)) {
        dispatch(utilityReducerActions.saveMigrationNeo3(migrationNeo3))

        throw new Error('Migration to Neo 3 is not supported for this blockchain service')
      }

      const response = await waitForMigration({
        txId: migrationNeo3.hash,
        service,
        neo3Service,
        neo3Address: migrationNeo3.neo3Address,
      })

      match(response)
        .with({ isTransactionConfirmed: false }, () => {
          notification.title = texts.failureRevalidateNeoLegacyNotification.title
          notification.previewBody = texts.failureRevalidateNeoLegacyNotification.previewBody
        })
        .with({ isNeo3TransactionConfirmed: false }, () => {
          notification.title = texts.failureRevalidateNeo3Notification.title
          notification.previewBody = texts.failureRevalidateNeo3Notification.previewBody
        })
        .otherwise(() => {
          migrationNeo3.status = 'done'
          notification.title = texts.successRevalidateNotification.title
          notification.previewBody = texts.successRevalidateNotification.previewBody
          notification.action = {
            type: 'navigate',
            payload: {
              to: 'account-transaction',
              address: migrationNeo3.account.address,
              blockchain: migrationNeo3.account.blockchain,
            },
          }
        })
    } catch {
      /* empty */
    }

    dispatch(utilityReducerActions.saveMigrationNeo3(migrationNeo3))
    dispatch(authReducerActions.saveNotification(notification))
  }
)
