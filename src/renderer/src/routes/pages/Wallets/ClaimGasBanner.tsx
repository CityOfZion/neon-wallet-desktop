import { Fragment, useEffect, useMemo } from 'react'

import { IBlockchainService, IBSWithClaim } from '@cityofzion/blockchain-service'
import { useTranslation } from 'react-i18next'
import { match } from 'ts-pattern'

import { BlockchainIcon } from '@renderer/components/BlockchainIcon'
import { Button } from '@renderer/components/Button'
import { Loader } from '@renderer/components/Loader'
import { Tooltip } from '@renderer/components/Tooltip'

import { LoggerHelper } from '@renderer/helpers/LoggerHelper'
import { ToastHelper } from '@renderer/helpers/ToastHelper'

import { useBalance } from '@renderer/hooks/useBalances'
import { useIsTruncated } from '@renderer/hooks/useIsTruncated'
import { useUnclaimed, useUnclaimedMutation } from '@renderer/hooks/useUnclaimed'

import TbTransform from '@renderer/assets/images/tb-transform.svg?react'

import { TBlockchainServiceKey } from '@shared/types/blockchain'
import { TAccount } from '@shared/types/store'

type TProps = {
  account: TAccount
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

  const { ref: messageRef, isTruncated: isMessageTruncated } = useIsTruncated<HTMLSpanElement>()

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
        <div className="flex h-full w-full items-center justify-between gap-x-4 px-4">
          <div className="flex min-w-0 items-center gap-x-2">
            <div className="flex shrink-0 items-center gap-x-1.5">
              <BlockchainIcon className="text-green" blockchain={account.blockchain} />
              {claimToken.symbol}
            </div>

            {match({
              feeIsLessThanBalance,
              feeIsLessThanUnclaimed,
              unclaimedNumber: unclaimedQuery.data?.unclaimedNumber,
            })
              .with({ unclaimedNumber: 0 }, () => (
                <Tooltip
                  title={t('youDoNotHaveUnclaimed', { symbol: claimToken.symbol })}
                  open={isMessageTruncated ? undefined : false}
                  variant="black"
                  delayDuration={0}
                  contentProps={{ className: 'max-w-64' }}
                >
                  <span ref={messageRef} className="truncate text-gray-300">
                    {t('youDoNotHaveUnclaimed', { symbol: claimToken.symbol })}
                  </span>
                </Tooltip>
              ))
              .with({ feeIsLessThanUnclaimed: false }, () => (
                <Tooltip
                  title={t('unclaimedLessFee')}
                  open={isMessageTruncated ? undefined : false}
                  variant="black"
                  delayDuration={0}
                  contentProps={{ className: 'max-w-64' }}
                >
                  <span ref={messageRef} className="truncate text-gray-300">
                    {t('unclaimedLessFee')}
                  </span>
                </Tooltip>
              ))
              .with({ feeIsLessThanBalance: false }, () => (
                <Tooltip
                  title={t('balanceLessFee')}
                  open={isMessageTruncated ? undefined : false}
                  variant="black"
                  delayDuration={0}
                  contentProps={{ className: 'max-w-64' }}
                >
                  <span ref={messageRef} className="truncate text-gray-300">
                    {t('balanceLessFee')}
                  </span>
                </Tooltip>
              ))
              .with({ feeIsLessThanBalance: true }, () => (
                <Tooltip
                  title={
                    isWatchAccount
                      ? t('youHaveUnclaimed', { symbol: claimToken.symbol })
                      : `${t('youHaveUnclaimed', { symbol: claimToken.symbol })} ${t('feeToClaim', {
                          fee: unclaimedQuery.data?.fee,
                          symbol: claimToken.symbol,
                        })}`
                  }
                  open={isMessageTruncated ? undefined : false}
                  variant="black"
                  delayDuration={0}
                  contentProps={{ className: 'max-w-64' }}
                >
                  <span ref={messageRef} className="truncate text-gray-300">
                    <span className="text-gray-100">{t('youHaveUnclaimed', { symbol: claimToken.symbol })}</span>

                    {!isWatchAccount && (
                      <Fragment>
                        {` ${t('feeToClaim', {
                          fee: unclaimedQuery.data?.fee,
                          symbol: claimToken.symbol,
                        })}`}
                      </Fragment>
                    )}
                  </span>
                </Tooltip>
              ))
              .otherwise(() => (
                <Fragment />
              ))}
          </div>

          <div className="flex shrink-0 items-center gap-x-5">
            <span className="truncate">
              {t('claimAmount', {
                amount: unclaimedQuery.data?.unclaimed || 0,
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
