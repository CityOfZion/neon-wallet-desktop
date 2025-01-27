import { Account, hasLedger, isCalculableFee, isClaimable } from '@cityofzion/blockchain-service'
import { AccountHelper } from '@renderer/helpers/AccountHelper'
import { ToastHelper } from '@renderer/helpers/ToastHelper'
import { bsAggregator } from '@renderer/libs/blockchainService'
import { authReducerActions } from '@renderer/store/reducers/AuthReducer'
import { TBlockchainServiceKey, TNetwork } from '@shared/@types/blockchain'
import { TUseTransactionsTransfer } from '@shared/@types/hooks'
import { TUseUnclaimedResult } from '@shared/@types/query'
import { IAccountState } from '@shared/@types/store'
import { getI18next } from '@shared/libs/i18next'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { useCurrentLoginSessionSelector, useHasClaimPendingTransactionSelector } from './useAuthSelector'
import { useAppDispatch } from './useRedux'
import { useSelectedNetworkByBlockchainSelector } from './useSettingsSelector'

const { t } = getI18next()

const buildQueryKeyUnclaimed = (account: IAccountState, network: TNetwork<TBlockchainServiceKey>) => [
  'claim',
  account.address,
  network.id,
]

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
    unclaimed = await blockchainService.blockchainDataService.getUnclaimed(account.address)
  }

  const unclaimedNumber = parseFloat(unclaimed)

  let fee = '0'

  if (isCalculableFee(blockchainService) && unclaimedNumber > 0) {
    const key = await window.api.sendAsync('decryptBasedEncryptedSecret', {
      value: account.encryptedKey,
      encryptedSecret: encryptedPassword,
    })

    const isHardware = account.type === 'hardware'

    let serviceAccount: Account<TBlockchainServiceKey>

    if (isHardware && hasLedger(blockchainService)) {
      serviceAccount = blockchainService.generateAccountFromPublicKey(key)
      serviceAccount.isHardware = true
      serviceAccount.bip44Path = AccountHelper.getBip44Path(blockchainService, account.order)
    } else {
      serviceAccount = blockchainService.generateAccountFromKey(key)
    }

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

  const unclaimed = useQuery({
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

  return unclaimed
}

export const useUnclaimedMutation = () => {
  const { currentLoginSessionRef } = useCurrentLoginSessionSelector()
  const dispatch = useAppDispatch()
  const { networkByBlockchain } = useSelectedNetworkByBlockchainSelector()
  const queryClient = useQueryClient()

  const mutation = useMutation({
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

      const isHardware = account.type === 'hardware'

      let serviceAccount: Account<TBlockchainServiceKey>

      if (isHardware && hasLedger(blockchainService)) {
        serviceAccount = blockchainService.generateAccountFromPublicKey(key)
        serviceAccount.isHardware = true
        serviceAccount.bip44Path = AccountHelper.getBip44Path(blockchainService, account.order)
      } else {
        serviceAccount = blockchainService.generateAccountFromKey(key)
      }

      const transactionHash = await blockchainService.claim(serviceAccount)

      const transaction: TUseTransactionsTransfer = {
        hash: transactionHash,
        time: Date.now() / 1000,
        account: account,
        toAccount: account,
        isPending: true,
        isClaim: true,
        amount: '0',
        to: account.address,
        from: account.address,
        asset: blockchainService.burnToken.symbol,
        fromAccount: account,
      }

      dispatch(
        authReducerActions.waitPendingTransaction({
          transaction,
          blockchainService,
          network: networkByBlockchain[account.blockchain],
          account: serviceAccount,
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

  return mutation
}
