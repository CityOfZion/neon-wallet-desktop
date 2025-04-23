import { BSNeoLegacy, BSNeoLegacyConstants, BSNeoLegacyHelper } from '@cityofzion/bs-neo-legacy'
import { createAsyncThunk } from '@reduxjs/toolkit'
import { ReactQueryHelper } from '@renderer/helpers/ReactQueryHelper'
import { TRootState } from '@renderer/hooks/useRedux'
import { bsAggregator } from '@renderer/libs/blockchainService'
import { TBlockchainServiceKey } from '@shared/@types/blockchain'
import { TMigrationNeo3, TMigrationNeo3Status, TSaveNotification } from '@shared/@types/store'
import { getI18next } from '@shared/libs/i18next'
import { match } from 'ts-pattern'

import { authReducerActions } from '../reducers/AuthReducer'
import { utilityReducerActions } from '../reducers/UtilityReducer'

const { t } = getI18next()

export const waitMigration = createAsyncThunk<void, TMigrationNeo3>(
  'waitMigration',
  async (pendingMigrationNeo3, { getState, dispatch }) => {
    const state = getState() as TRootState
    const network = state.settings.data.selectedNetworkByBlockchain[pendingMigrationNeo3.neoLegacyAccount.blockchain]

    let status: TMigrationNeo3Status = 'pending'
    const notification: TSaveNotification = {
      title: t('pages:migrationNeo3.failureNotification.title'),
      previewBody: t('pages:migrationNeo3.failureNotification.previewBody'),
      related: {
        blockchain: pendingMigrationNeo3.neoLegacyAccount.blockchain,
        address: pendingMigrationNeo3.neoLegacyAccount.address,
      },
    }

    try {
      if (pendingMigrationNeo3.status === 'pending' || pendingMigrationNeo3.status === 'failure') {
        const transfer = {
          account: pendingMigrationNeo3.neoLegacyAccount,
          to: BSNeoLegacyConstants.MIGRATION_COZ_LEGACY_ADDRESS,
          from: pendingMigrationNeo3.neoLegacyAccount.address,
          hash: pendingMigrationNeo3.hash,
          time: pendingMigrationNeo3.time,
          fromAccount: pendingMigrationNeo3.neoLegacyAccount,
          isPending: true,
          isMigrate: true,
        }

        if (
          pendingMigrationNeo3.neoLegacyMigrationAmounts.hasEnoughGasBalance &&
          pendingMigrationNeo3.neoLegacyMigrationAmounts.gasBalance
        ) {
          dispatch(
            utilityReducerActions.addPendingTransaction({
              amount: pendingMigrationNeo3.neoLegacyMigrationAmounts.gasBalance.amount,
              asset: pendingMigrationNeo3.neoLegacyMigrationAmounts.gasBalance.token.symbol,
              assetHash: pendingMigrationNeo3.neoLegacyMigrationAmounts.gasBalance.token.hash,
              ...transfer,
            })
          )
        }

        if (
          pendingMigrationNeo3.neoLegacyMigrationAmounts.hasEnoughNeoBalance &&
          pendingMigrationNeo3.neoLegacyMigrationAmounts.neoBalance
        ) {
          dispatch(
            utilityReducerActions.addPendingTransaction({
              amount: pendingMigrationNeo3.neoLegacyMigrationAmounts.neoBalance.amount,
              asset: pendingMigrationNeo3.neoLegacyMigrationAmounts.neoBalance.token.symbol,
              assetHash: pendingMigrationNeo3.neoLegacyMigrationAmounts.neoBalance.token.hash,
              ...transfer,
            })
          )
        }
      }

      dispatch(utilityReducerActions.saveMigrationNeo3({ ...pendingMigrationNeo3, status }))

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
          status = 'failure'
        })
        .with({ isNeo3TransactionConfirmed: false }, () => {
          notification.title = t('pages:migrationNeo3.failureNeo3Notification.title')
          notification.previewBody = t('pages:migrationNeo3.failureNeo3Notification.previewBody')
          status = 'failure-neo3'
        })
        .otherwise(() => {
          notification.title = t('pages:migrationNeo3.successNotification.title')
          notification.previewBody = t('pages:migrationNeo3.successNotification.previewBody')
          notification.action = {
            type: 'navigate',
            payload: {
              to: 'account-transaction',
              address: pendingMigrationNeo3.neoLegacyAccount.address,
              blockchain: pendingMigrationNeo3.neoLegacyAccount.blockchain,
            },
          }
          status = 'done'
        })
    } catch {
      /* empty */
    }

    ReactQueryHelper.invalidateTransactionQueries(pendingMigrationNeo3.neoLegacyAccount, network)

    dispatch(utilityReducerActions.saveMigrationNeo3({ ...pendingMigrationNeo3, status }))
    dispatch(authReducerActions.saveNotification(notification))
    dispatch(utilityReducerActions.removePendingTransaction(pendingMigrationNeo3.hash))
  }
)
