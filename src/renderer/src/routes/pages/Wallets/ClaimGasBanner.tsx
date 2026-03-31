import { Fragment, useEffect, useMemo } from 'react'

import { IBlockchainService, IBSWithClaim } from '@cityofzion/blockchain-service'
import { useTranslation } from 'react-i18next'
import { match } from 'ts-pattern'

import { BlockchainIcon } from '@renderer/components/BlockchainIcon'
import { Button } from '@renderer/components/Button'
import { Loader } from '@renderer/components/Loader'

import { LoggerHelper } from '@renderer/helpers/LoggerHelper'
import { ToastHelper } from '@renderer/helpers/ToastHelper'

import { useBalance } from '@renderer/hooks/useBalances'
import { useUnclaimed, useUnclaimedMutation } from '@renderer/hooks/useUnclaimed'

import TbTransform from '@renderer/assets/images/tb-transform.svg?react'

import { TBlockchainServiceKey } from '@shared/types/blockchain'
import { IAccountState } from '@shared/types/store'

type TProps = {
  account: IAccountState
  blockchainService: IBlockchainService<TBlockchainServiceKey> & IBSWithClaim<TBlockchainServiceKey>
}

export const ClaimGasBanner = ({ account, blockchainService }: TProps) => {
  const { t } = useTranslation('components', { keyPrefix: 'claimGasButton' })

  const balance = useBalance(account)

  const unclaimedQuery = useUnclaimed(account)
  const unclaimedMutation = useUnclaimedMutation()

  const feeIsLessThanBalance = useMemo(() => {
    if (!balance.data || !unclaimedQuery.data || unclaimedQuery.data.unclaimedNumber <= 0) return undefined

    const tokenBalance = balance.data.tokensBalances.find(
      tokenBalance => tokenBalance.token.symbol === blockchainService.feeToken.symbol
    )
    if (!tokenBalance) return false

    return tokenBalance.amountNumber > unclaimedQuery.data.feeNumber
  }, [balance.data, unclaimedQuery.data, blockchainService])

  const feeIsLessThanUnclaimed = unclaimedQuery.data
    ? unclaimedQuery.data.feeNumber < unclaimedQuery.data.unclaimedNumber
    : undefined

  const isWatchAccount = account.type === 'watch'
  const claimToken = blockchainService.claimService.claimToken

  useEffect(() => {
    if (!unclaimedQuery.error) return

    ToastHelper.error({ message: t('errorToGetUnclaimed') })
    LoggerHelper.error(unclaimedQuery.error, { where: 'ClaimGasBanner', operation: 'getUnclaimed' })
  }, [t, unclaimedQuery.error])

  return (
    <div className="bg-asphalt mb-5 flex h-13.75 w-full items-center justify-center rounded-sm text-sm">
      {unclaimedQuery.isLoading || balance.isLoading ? (
        <Loader />
      ) : (
        <div className="flex h-full w-full items-center justify-between px-4">
          <div className="flex items-center gap-x-2">
            <div className="flex items-center gap-x-1.5">
              <BlockchainIcon className="text-green" blockchain={account.blockchain} />
              {claimToken.symbol}
            </div>

            {match({
              feeIsLessThanBalance,
              feeIsLessThanUnclaimed,
              unclaimedNumber: unclaimedQuery.data?.unclaimedNumber,
            })
              .with({ unclaimedNumber: 0 }, () => (
                <span className="text-gray-300">
                  {t('youDoNotHaveUnclaimed', {
                    symbol: claimToken.symbol,
                  })}
                </span>
              ))
              .with({ feeIsLessThanUnclaimed: false }, () => (
                <span className="text-gray-300">{t('unclaimedLessFee')}</span>
              ))
              .with({ feeIsLessThanBalance: false }, () => <span className="text-gray-300">{t('balanceLessFee')}</span>)
              .with({ feeIsLessThanBalance: true }, () => (
                <div className="flex gap-x-1">
                  <span className="text-gray-100">
                    {t('youHaveUnclaimed', {
                      symbol: claimToken.symbol,
                    })}
                  </span>

                  {!isWatchAccount && (
                    <span className="text-gray-300">
                      {t('feeToClaim', {
                        fee: unclaimedQuery.data?.fee,
                        symbol: claimToken.symbol,
                      })}
                    </span>
                  )}
                </div>
              ))
              .otherwise(() => (
                <Fragment />
              ))}
          </div>

          <div className="flex items-center gap-x-5">
            <span className="truncate">
              {t('claimAmount', {
                amount: unclaimedQuery.data?.unclaimed ?? 0,
                symbol: claimToken.symbol,
              })}
            </span>

            <Button
              label={t('buttonLabel')}
              className="w-28"
              leftIcon={<TbTransform aria-hidden />}
              disabled={
                isWatchAccount ||
                !feeIsLessThanBalance ||
                !feeIsLessThanUnclaimed ||
                !unclaimedQuery.data ||
                unclaimedQuery.data.unclaimedNumber <= 0
              }
              flat
              loading={unclaimedMutation.isPending}
              onClick={() => unclaimedMutation.mutate(account)}
            />
          </div>
        </div>
      )}
    </div>
  )
}
