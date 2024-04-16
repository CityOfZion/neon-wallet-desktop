import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { TbStepInto } from 'react-icons/tb'
import { BlockchainService, hasLedger, isCalculableFee, isClaimable } from '@cityofzion/blockchain-service'
import { TBlockchainServiceKey } from '@renderer/@types/blockchain'
import { IAccountState } from '@renderer/@types/store'
import { Button } from '@renderer/components/Button'
import { ToastHelper } from '@renderer/helpers/ToastHelper'
import { useBalances } from '@renderer/hooks/useBalances'
import { useAppDispatch } from '@renderer/hooks/useRedux'
import { useEncryptedPasswordSelector } from '@renderer/hooks/useSettingsSelector'
import { accountReducerActions } from '@renderer/store/reducers/AccountReducer'
import { useQuery } from '@tanstack/react-query'

type TProps = {
  account: IAccountState
  blockchainService: BlockchainService<TBlockchainServiceKey>
}

export const ClaimGasButton = ({ account, blockchainService }: TProps) => {
  const { t } = useTranslation('components', { keyPrefix: 'claimGasButton' })
  const { t: commonT } = useTranslation('common')
  const { encryptedPassword } = useEncryptedPasswordSelector()
  const dispatch = useAppDispatch()
  const balance = useBalances(account)

  const [loadingClaim, setLoadingClaim] = useState(false)
  const [hasClaimed, setHasClaimed] = useState(false)

  const accountFeeTokenBalance = useMemo(() => {
    if (!balance || !balance.data) return undefined

    const tokenBalance = balance?.data.tokensBalances.find(
      tokenBalance => tokenBalance.token.symbol === blockchainService.feeToken.symbol
    )

    if (!tokenBalance) return 0

    return tokenBalance.amountNumber
  }, [balance, blockchainService])

  const { data: unclaimedData, isLoading: unclaimedDataIsLoading } = useQuery({
    queryKey: ['claim', account.address],
    queryFn: async () => {
      if (!isClaimable(blockchainService) || !account.encryptedKey || !isCalculableFee(blockchainService))
        throw new Error()

      const unclaimed = await blockchainService.blockchainDataService.getUnclaimed(account.address)

      const key = await window.api.decryptBasedEncryptedSecret(account.encryptedKey, encryptedPassword)

      const fee = await blockchainService.calculateTransferFee({
        senderAccount: blockchainService.generateAccountFromKey(key),
        intent: {
          amount: '0',
          receiverAddress: account.address,
          tokenHash: blockchainService.burnToken.hash,
          tokenDecimals: blockchainService.burnToken.decimals,
        },
      })

      return { unclaimed, fee }
    },
    gcTime: 0,
    staleTime: 0,
    retry: false,
  })

  const handleClaimGas = async () => {
    try {
      if (!isClaimable(blockchainService) || !unclaimedData || !accountFeeTokenBalance || !account.encryptedKey) return

      setLoadingClaim(true)

      if (accountFeeTokenBalance < Number(unclaimedData.fee)) throw new Error()

      const key = await window.api.decryptBasedEncryptedSecret(account.encryptedKey, encryptedPassword)

      const isLedger = account.type === 'ledger'

      const serviceAccount =
        isLedger && hasLedger(blockchainService)
          ? blockchainService.generateAccountFromPublicKey(key)
          : blockchainService.generateAccountFromKey(key)

      let transactionHash: string
      const claimPromise = blockchainService.claim(serviceAccount, isLedger)
      if (isLedger) {
        transactionHash = await ToastHelper.promise(claimPromise, { message: commonT('ledger.requestingPermission') })
      } else {
        transactionHash = await claimPromise
      }

      dispatch(
        accountReducerActions.addPendingTransaction({
          hash: transactionHash,
          time: Date.now() / 1000,
          account: account,
          toAccount: account,
          isPending: true,
          amount: unclaimedData?.unclaimed,
          to: account.address,
          from: 'claim',
          type: 'token',
          contractHash: blockchainService.claimToken.hash,
          token: blockchainService.claimToken,
        })
      )
      dispatch(accountReducerActions.watchPendingTransaction({ transactionHash, blockchainService }))

      setHasClaimed(true)
    } catch {
      ToastHelper.error({ message: t('errorDecryptKey') })
    } finally {
      setLoadingClaim(false)
    }
  }

  return (
    <Button
      label={t('label', { amount: hasClaimed ? undefined : unclaimedData?.unclaimed })}
      leftIcon={<TbStepInto className="text-neon w-5 h-5" />}
      variant="outlined"
      disabled={
        !accountFeeTokenBalance ||
        !unclaimedData ||
        !unclaimedData.unclaimed ||
        parseFloat(unclaimedData.fee) > accountFeeTokenBalance ||
        hasClaimed
      }
      loading={unclaimedDataIsLoading || balance.isLoading || loadingClaim}
      flat
      onClick={handleClaimGas}
    />
  )
}
