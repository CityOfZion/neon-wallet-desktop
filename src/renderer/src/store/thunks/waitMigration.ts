import { BSNeoLegacy, BSNeoLegacyConstants } from '@cityofzion/bs-neo-legacy'
import { createAsyncThunk } from '@reduxjs/toolkit'
import { match } from 'ts-pattern'

import { ReactQueryHelper } from '@renderer/helpers/ReactQueryHelper'

import { Neo3NeoLegacyMigrationService } from '@cityofzion/bs-neo-legacy/dist/services/migration/Neo3NeoLegacyMigrationService'
import { bsAggregator } from '@renderer/libs/blockchain-service'
import type { TRootState } from '@renderer/types/redux'
import { TBlockchainServiceKey } from '@shared/@types/blockchain'
import { TMigrationNeo3, TMigrationNeo3Status, TSaveNotification } from '@shared/@types/store'

import { authReducerActions } from '../reducers/auth'
import { utilityReducerActions } from '../reducers/utility'

export const waitMigration = createAsyncThunk<void, TMigrationNeo3>(
  'waitMigration',
  async (pendingMigrationNeo3, { getState, dispatch }) => {
    const state = getState() as TRootState
    const network =
      state.settings.data.selectedNetworkProfile.networkByBlockchain[pendingMigrationNeo3.neoLegacyAccount.blockchain]

    let status: TMigrationNeo3Status = 'pending'
    const notification: TSaveNotification = {
      title: 'pages:migrationNeo3.failureNotification.title',
      previewBody: 'pages:migrationNeo3.failureNotification.previewBody',
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
          const token = pendingMigrationNeo3.neoLegacyMigrationAmounts.gasBalance.token

          dispatch(
            utilityReducerActions.addPendingTransaction({
              amount: pendingMigrationNeo3.neoLegacyMigrationAmounts.gasBalance.amount,
              asset: token.symbol,
              assetHash: token.hash,
              token,
              ...transfer,
            })
          )
        }

        if (
          pendingMigrationNeo3.neoLegacyMigrationAmounts.hasEnoughNeoBalance &&
          pendingMigrationNeo3.neoLegacyMigrationAmounts.neoBalance
        ) {
          const token = pendingMigrationNeo3.neoLegacyMigrationAmounts.neoBalance.token

          dispatch(
            utilityReducerActions.addPendingTransaction({
              amount: pendingMigrationNeo3.neoLegacyMigrationAmounts.neoBalance.amount,
              asset: token.symbol,
              assetHash: token.hash,
              token,
              ...transfer,
            })
          )
        }
      }

      dispatch(utilityReducerActions.saveMigrationNeo3({ ...pendingMigrationNeo3, status }))

      const neo3Service = bsAggregator.blockchainServicesByName.neo3
      const neoLegacyService = bsAggregator.blockchainServicesByName.neoLegacy as BSNeoLegacy<TBlockchainServiceKey>

      const response = await Neo3NeoLegacyMigrationService.waitForMigration({
        neoLegacyService,
        neo3Service,
        neo3Address: pendingMigrationNeo3.neo3Address,
        transactionHash: pendingMigrationNeo3.hash,
      })

      match(response)
        .with({ isTransactionConfirmed: false }, () => {
          notification.title = 'pages:migrationNeo3.failureNeoLegacyNotification.title'
          notification.previewBody = 'pages:migrationNeo3.failureNeoLegacyNotification.previewBody'
          status = 'failure'
        })
        .with({ isNeo3TransactionConfirmed: false }, () => {
          notification.title = 'pages:migrationNeo3.failureNeo3Notification.title'
          notification.previewBody = 'pages:migrationNeo3.failureNeo3Notification.previewBody'
          status = 'failure-neo3'
        })
        .otherwise(() => {
          notification.title = 'pages:migrationNeo3.successNotification.title'
          notification.previewBody = 'pages:migrationNeo3.successNotification.previewBody'
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
