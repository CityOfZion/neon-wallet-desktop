import { isClaimable } from '@cityofzion/blockchain-service'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { AccountHelper } from '@renderer/helpers/AccountHelper'
import { BlockchainServiceHelper } from '@renderer/helpers/BlockchainServiceHelper'
import { LoggerHelper } from '@renderer/helpers/LoggerHelper'
import { ToastHelper } from '@renderer/helpers/ToastHelper'
import { TransactionHelper } from '@renderer/helpers/TransactionHelper'

import { thunks } from '@renderer/store/thunks'
import { AppError } from '@shared/helpers/SharedErrorHelper'
import { SharedI18nextHelper } from '@shared/helpers/SharedI18nextHelper'
import { TNetwork } from '@shared/types/blockchain'
import { TUseUnclaimedResult } from '@shared/types/query'
import { IAccountState } from '@shared/types/store'

import { useLoginSessionSelector } from './useAuthSelector'
import { useAppDispatch } from './useRedux'
import { useSelectedNetworkByBlockchainSelector } from './useSettingsSelector'
import { useHasClaimPendingTransactionSelector } from './useUtilitySelector'

const { t } = SharedI18nextHelper.get()

const buildQueryKeyUnclaimed = (account: IAccountState, network: TNetwork) => ['claim', account.address, network]

const getUnclaimedInfos = async (
  account: IAccountState,
  hasClaimPendingTransaction: boolean,
  encryptedPassword?: string
): Promise<TUseUnclaimedResult> => {
  const service = BlockchainServiceHelper.bsAggregator.blockchainServicesByName[account.blockchain]
  if (!isClaimable(service)) {
    throw new AppError(
      t('common:errors.blockchainIsNotClaimable', { address: account.address, blockchain: account.blockchain })
    )
  }

  let unclaimed = '0'

  if (!hasClaimPendingTransaction) {
    unclaimed = await service.claimDataService.getUnclaimed(account.address)
  }

  const unclaimedNumber = parseFloat(unclaimed)

  let fee = '0'

  if (account.type !== 'watch' && !!account.encryptedKey && unclaimedNumber > 0) {
    const key = await window.api.sendAsync('encryption:decryptBasedEncryptedSecret', {
      value: account.encryptedKey,
      encryptedSecret: encryptedPassword,
    })

    const serviceAccount = await AccountHelper.getServiceAccount({ account, key })

    try {
      fee = await service.calculateClaimFee(serviceAccount)
    } catch {
      /* empty */
    }
  }

  return { unclaimed, unclaimedNumber, fee, feeNumber: parseFloat(fee) }
}

export const useUnclaimed = (account: IAccountState) => {
  const { loginSessionRef } = useLoginSessionSelector()
  const { hasClaimPendingTransactionRef } = useHasClaimPendingTransactionSelector(account)
  const { networkByBlockchain } = useSelectedNetworkByBlockchainSelector()

  return useQuery({
    queryKey: buildQueryKeyUnclaimed(account, networkByBlockchain[account.blockchain]),
    staleTime: 0,
    gcTime: 0,
    retry: false,
    queryFn: getUnclaimedInfos.bind(
      null,
      account,
      hasClaimPendingTransactionRef.current,
      loginSessionRef.current?.encryptedPassword
    ),
  })
}

export const useUnclaimedMutation = () => {
  const { loginSessionRef } = useLoginSessionSelector()
  const { networkByBlockchain } = useSelectedNetworkByBlockchainSelector()
  const queryClient = useQueryClient()
  const dispatch = useAppDispatch()

  return useMutation({
    mutationFn: async (account: IAccountState) => {
      if (!loginSessionRef.current) {
        throw new AppError(t('common:errors.loginSessionIsNotDefined'))
      }

      const service = BlockchainServiceHelper.bsAggregator.blockchainServicesByName[account.blockchain]
      if (!isClaimable(service)) {
        throw new AppError(
          t('common:errors.blockchainIsNotClaimable', { address: account.address, blockchain: account.blockchain })
        )
      }

      if (!account.encryptedKey) return

      const key = await window.api.sendAsync('encryption:decryptBasedEncryptedSecret', {
        value: account.encryptedKey,
        encryptedSecret: loginSessionRef.current.encryptedPassword,
      })

      const serviceAccount = await AccountHelper.getServiceAccount({ account, key })
      const transaction = await service.claim(serviceAccount)

      const pendingTransaction = TransactionHelper.buildPendingTransaction({
        transaction,
        account,
        senderAccount: account,
        receiverAccounts: [account],
      })

      const notificationPrefix = 'hooks:useUnclaimedMutation'
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
      LoggerHelper.sentry(error, { where: 'useUnclaimedMutation' })
      ToastHelper.error({ message: t('hooks:useUnclaimedMutation.errors.claimError') })
    },
    onSuccess: (_data, account) => {
      queryClient.setQueryData(buildQueryKeyUnclaimed(account, networkByBlockchain[account.blockchain]), {
        unclaimed: '0',
        unclaimedNumber: 0,
        fee: '0',
        feeNumber: 0,
      })
    },
  })
}
