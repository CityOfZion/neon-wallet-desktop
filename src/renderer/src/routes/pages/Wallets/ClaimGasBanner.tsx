import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { TbTransform } from 'react-icons/tb'
import { BlockchainService, BSClaimable, hasLedger, isCalculableFee } from '@cityofzion/blockchain-service'
import { BlockchainIcon } from '@renderer/components/BlockchainIcon'
import { Button } from '@renderer/components/Button'
import { Loader } from '@renderer/components/Loader'
import { ToastHelper } from '@renderer/helpers/ToastHelper'
import { useBalances } from '@renderer/hooks/useBalances'
import { useAppDispatch } from '@renderer/hooks/useRedux'
import { useEncryptedPasswordSelector } from '@renderer/hooks/useSettingsSelector'
import { accountReducerActions } from '@renderer/store/reducers/AccountReducer'
import { TBlockchainServiceKey } from '@shared/@types/blockchain'
import { IAccountState } from '@shared/@types/store'
import { useQuery } from '@tanstack/react-query'

type TProps = {
  account: IAccountState
  blockchainService: BlockchainService<TBlockchainServiceKey> & BSClaimable
}

const getUnclaimedInfos = async (
  account: IAccountState,
  blockchainService: BlockchainService<TBlockchainServiceKey> & BSClaimable,
  encryptedPassword?: string
) => {
  if (!account.encryptedKey) throw new Error()

  const unclaimed = await blockchainService.blockchainDataService.getUnclaimed(account.address)

  const key = await window.api.sendAsync('decryptBasedEncryptedSecret', {
    value: account.encryptedKey,
    encryptedSecret: encryptedPassword,
  })

  let fee = '0'

  if (isCalculableFee(blockchainService)) {
    fee = await blockchainService.calculateTransferFee({
      senderAccount: blockchainService.generateAccountFromKey(key),
      intent: {
        amount: '0',
        receiverAddress: account.address,
        tokenHash: blockchainService.burnToken.hash,
        tokenDecimals: blockchainService.burnToken.decimals,
      },
    })
  }

  return { unclaimed, unclaimedNumber: parseFloat(unclaimed), fee, feeNumber: parseFloat(fee) }
}

export const ClaimGasBanner = ({ account, blockchainService }: TProps) => {
  const { t } = useTranslation('components', { keyPrefix: 'claimGasButton' })
  const { encryptedPassword } = useEncryptedPasswordSelector()
  const dispatch = useAppDispatch()
  const balances = useBalances([account])

  const unclaimed = useQuery({
    queryKey: ['claim', account.address],
    queryFn: getUnclaimedInfos.bind(null, account, blockchainService, encryptedPassword),
    staleTime: 0,
    retry: false,
  })

  const [claiming, setClaiming] = useState(false)

  const feeIsLessThanBalance = useMemo(() => {
    if (!balances.data || !unclaimed.data || unclaimed.data.unclaimedNumber <= 0) return undefined

    const tokenBalance = balances.data[0]?.tokensBalances.find(
      tokenBalance => tokenBalance.token.symbol === blockchainService.feeToken.symbol
    )
    if (!tokenBalance) return false

    return tokenBalance.amountNumber > unclaimed.data.feeNumber
  }, [balances, unclaimed, blockchainService])

  const handleClaimGas = async () => {
    try {
      setClaiming(true)
      if (!unclaimed.data?.unclaimed || !account.encryptedKey) return

      const key = await window.api.sendAsync('decryptBasedEncryptedSecret', {
        value: account.encryptedKey,
        encryptedSecret: encryptedPassword,
      })

      const isLedger = account.type === 'ledger'

      const serviceAccount =
        isLedger && hasLedger(blockchainService)
          ? blockchainService.generateAccountFromPublicKey(key)
          : blockchainService.generateAccountFromKey(key)

      const transactionHash = await blockchainService.claim(serviceAccount, isLedger)

      dispatch(
        accountReducerActions.addPendingTransaction({
          hash: transactionHash,
          time: Date.now() / 1000,
          account: account,
          toAccount: account,
          isPending: true,
          amount: unclaimed.data?.unclaimed,
          to: account.address,
          from: 'claim',
          type: 'token',
          contractHash: blockchainService.claimToken.hash,
          token: blockchainService.claimToken,
        })
      )
      dispatch(accountReducerActions.watchPendingTransaction({ transactionHash, blockchainService }))
    } catch {
      ToastHelper.error({ message: t('errorDecryptKey') })
    } finally {
      setClaiming(false)
    }
  }

  return (
    <div className="w-full bg-asphalt flex items-center justify-center rounded h-[55px] mt-5 text-sm">
      {unclaimed.isLoading || balances.isLoading ? (
        <Loader />
      ) : (
        <div className="w-full flex justify-between items-center h-full px-4">
          <div className="flex items-center gap-x-2">
            <div className="flex items-center gap-x-1">
              <BlockchainIcon blockchain={account.blockchain} type="green" />
              {blockchainService.claimToken.symbol}
            </div>

            {feeIsLessThanBalance === true ? (
              <div className="flex gap-x-1">
                <span className="text-gray-100">
                  {t('youHaveUnclaimed', {
                    symbol: blockchainService.claimToken.symbol,
                  })}
                </span>

                <span className="text-gray-300">
                  {t('feeToClaim', {
                    fee: unclaimed.data?.fee,
                    symbol: blockchainService.claimToken.symbol,
                  })}
                </span>
              </div>
            ) : (
              feeIsLessThanBalance === false && <span className="text-gray-300">{t('cantClaim')}</span>
            )}
          </div>

          <div className="flex items-center gap-x-5">
            {unclaimed.data?.unclaimed && (
              <span>
                {t('claimAmount', {
                  amount: unclaimed.data.unclaimed,
                  symbol: blockchainService.claimToken.symbol,
                })}
              </span>
            )}

            <Button
              label={t('buttonLabel')}
              leftIcon={<TbTransform />}
              disabled={!!feeIsLessThanBalance}
              flat
              loading={claiming}
              onClick={handleClaimGas}
            />
          </div>
        </div>
      )}
    </div>
  )
}
