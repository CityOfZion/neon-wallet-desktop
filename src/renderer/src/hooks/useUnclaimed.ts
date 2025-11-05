import { isCalculableFee, isClaimable } from '@cityofzion/blockchain-service'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { AccountHelper } from '@renderer/helpers/AccountHelper'
import { DateHelper } from '@renderer/helpers/DateHelper'
import { ToastHelper } from '@renderer/helpers/ToastHelper'

import { bsAggregator } from '@renderer/libs/blockchain-service'
import { thunks } from '@renderer/store/thunks'
import { getI18next } from '@shared/libs/i18next'
import { TNetwork } from '@shared/types/blockchain'
import { TUseTransactionsTransfer } from '@shared/types/hooks'
import { TUseUnclaimedResult } from '@shared/types/query'
import { IAccountState } from '@shared/types/store'

import { useCurrentLoginSessionSelector } from './useAuthSelector'
import { useAppDispatch } from './useRedux'
import { useSelectedNetworkByBlockchainSelector } from './useSettingsSelector'
import { useHasClaimPendingTransactionSelector } from './useUtilitySelector'

const { t } = getI18next()

const buildQueryKeyUnclaimed = (account: IAccountState, network: TNetwork) => ['claim', account.address, network]

const getUnclaimedInfos = async (
  account: IAccountState,
  hasClaimPendingTransaction: boolean,
  encryptedPassword?: string
): Promise<TUseUnclaimedResult> => {
  if (!account.encryptedKey) throw new Error(t('common:errors.noEncryptedKey', { address: account.address }))

  const blockchainService = bsAggregator.blockchainServicesByName[account.blockchain]
  if (!isClaimable(blockchainService)) {
    throw new Error(
      t('common:errors.blockchainIsNotClaimable', { address: account.address, blockchain: account.blockchain })
    )
  }

  let unclaimed = '0'

  if (!hasClaimPendingTransaction) {
    unclaimed = await blockchainService.claimDataService.getUnclaimed(account.address)
  }

  const unclaimedNumber = parseFloat(unclaimed)

  let fee = '0'

  if (isCalculableFee(blockchainService) && unclaimedNumber > 0) {
    const key = await window.api.sendAsync('decryptBasedEncryptedSecret', {
      value: account.encryptedKey,
      encryptedSecret: encryptedPassword,
    })

    const serviceAccount = AccountHelper.getServiceAccount({ account, key })

    fee = await blockchainService.calculateTransferFee({
      intents: [
        {
          amount: '0',
          receiverAddress: account.address,
          tokenHash: blockchainService.burnToken.hash,
          tokenDecimals: blockchainService.burnToken.decimals,
        },
      ],
      senderAccount: serviceAccount,
    })
  }

  return { unclaimed, unclaimedNumber, fee, feeNumber: parseFloat(fee) }
}

export const useUnclaimed = (account: IAccountState) => {
  const { currentLoginSessionRef } = useCurrentLoginSessionSelector()
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
      currentLoginSessionRef.current?.encryptedPassword
    ),
  })
}

export const useUnclaimedMutation = () => {
  const { currentLoginSessionRef } = useCurrentLoginSessionSelector()
  const { networkByBlockchain } = useSelectedNetworkByBlockchainSelector()
  const queryClient = useQueryClient()
  const dispatch = useAppDispatch()

  return useMutation({
    mutationFn: async (account: IAccountState) => {
      if (!currentLoginSessionRef.current) {
        throw new Error(t('common:errors.loginSessionIsNotDefined'))
      }

      const blockchainService = bsAggregator.blockchainServicesByName[account.blockchain]
      if (!isClaimable(blockchainService)) {
        throw new Error(
          t('common:errors.blockchainIsNotClaimable', { address: account.address, blockchain: account.blockchain })
        )
      }

      if (!account.encryptedKey) return

      const key = await window.api.sendAsync('decryptBasedEncryptedSecret', {
        value: account.encryptedKey,
        encryptedSecret: currentLoginSessionRef.current.encryptedPassword,
      })

      const serviceAccount = AccountHelper.getServiceAccount({ account, key })
      const transactionHash = await blockchainService.claim(serviceAccount)
      const token = blockchainService.burnToken

      const transaction: TUseTransactionsTransfer = {
        hash: transactionHash,
        time: DateHelper.getNowUnix(),
        account: account,
        toAccount: account,
        isPending: true,
        isClaim: true,
        amount: '0',
        to: account.address,
        from: account.address,
        asset: token.symbol,
        assetHash: token.hash,
        token,
        fromAccount: account,
      }

      dispatch(
        thunks.waitTransaction({
          transaction,
          successNotification: {
            title: 'hooks:useUnclaimedMutation.successNotification.title',
            previewBody: 'hooks:useUnclaimedMutation.successNotification.previewBody',
          },
          failureNotification: {
            title: 'hooks:useUnclaimedMutation.failureNotification.title',
            previewBody: 'hooks:useUnclaimedMutation.failureNotification.previewBody',
          },
        })
      )
    },
    onError: error => {
      console.error(error)
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
