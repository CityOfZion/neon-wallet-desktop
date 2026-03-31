import { hasFaucet } from '@cityofzion/blockchain-service'
import { useMutation } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'

import { BlockchainServiceHelper } from '@renderer/helpers/BlockchainServiceHelper'
import { LoggerHelper } from '@renderer/helpers/LoggerHelper'
import { ToastHelper } from '@renderer/helpers/ToastHelper'
import { TransactionHelper } from '@renderer/helpers/TransactionHelper'

import { thunks } from '@renderer/store/thunks'
import { AppError } from '@shared/helpers/SharedErrorHelper'
import type { IAccountState } from '@shared/types/store'

import { useAppDispatch } from './useRedux'

export const useFaucetMutation = () => {
  const { t } = useTranslation('hooks', { keyPrefix: 'useFaucetMutation' })
  const { t: tCommon } = useTranslation('common')
  const dispatch = useAppDispatch()

  return useMutation({
    mutationFn: async (account: IAccountState) => {
      const service = BlockchainServiceHelper.bsAggregator.blockchainServicesByNameRecord[account.blockchain]
      if (!hasFaucet(service)) {
        throw new AppError(tCommon('errors.blockchainDoesNotSupportFaucet'))
      }

      const transaction = await service.faucet(account.address)
      const pendingTransaction = TransactionHelper.buildPendingTransaction({
        transaction,
        account,
        receiverAccounts: [account],
      })

      const notificationPrefix = 'hooks:useFaucetMutation'
      const notificationSuccessPrefix = `${notificationPrefix}.successNotification`
      const notificationFailurePrefix = `${notificationPrefix}.failureNotification`

      dispatch(
        thunks.waitPendingTransaction({
          pendingTransaction,
          successNotification: {
            title: `${notificationSuccessPrefix}.title`,
            previewBody: `${notificationSuccessPrefix}.previewBody`,
          },
          failureNotification: {
            title: `${notificationFailurePrefix}.title`,
            previewBody: `${notificationFailurePrefix}.previewBody`,
          },
        })
      )
    },
    onError: error => {
      LoggerHelper.sentry(error, { where: 'useFaucetMutation' })
      ToastHelper.error({ message: t('errors.faucetError') })
    },
  })
}
