import { BSNeoLegacy, BSNeoLegacyHelper } from '@cityofzion/bs-neo-legacy'
import { createAsyncThunk } from '@reduxjs/toolkit'
import { bsAggregator } from '@renderer/libs/blockchainService'
import { TBlockchainServiceKey } from '@shared/@types/blockchain'
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
      related: {
        blockchain: migrationNeo3.neoLegacyAccount.blockchain,
        address: migrationNeo3.neoLegacyAccount.address,
      },
    }

    try {
      migrationNeo3.status = 'pending'

      dispatch(utilityReducerActions.saveMigrationNeo3(migrationNeo3))

      migrationNeo3.status = 'failure'

      const neoLegacyService = bsAggregator.blockchainServicesByName[
        migrationNeo3.neoLegacyAccount.blockchain
      ] as BSNeoLegacy<TBlockchainServiceKey>
      const neo3Service = bsAggregator.blockchainServicesByName.neo3

      const response = await BSNeoLegacyHelper.waitForMigration({
        neo3Address: migrationNeo3.neo3Address,
        neoLegacyService,
        neo3Service,
        transactionHash: migrationNeo3.hash,
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
              address: migrationNeo3.neoLegacyAccount.address,
              blockchain: migrationNeo3.neoLegacyAccount.blockchain,
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
