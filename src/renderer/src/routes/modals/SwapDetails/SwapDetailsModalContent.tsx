import { Fragment } from 'react'

import type { TSwapResult } from '@cityofzion/bs-multichain'
import { useTranslation } from 'react-i18next'
import { match, P } from 'ts-pattern'

import { BlockchainIcon } from '@renderer/components/BlockchainIcon'
import { Button } from '@renderer/components/Button'
import { Details } from '@renderer/components/Details'
import { Link } from '@renderer/components/Link'
import { Separator } from '@renderer/components/Separator'
import { Stepper } from '@renderer/components/Stepper'

import { BlockchainServiceHelper } from '@renderer/helpers/BlockchainServiceHelper'
import { CrispHelper } from '@renderer/helpers/CrispHelper'
import { StringHelper } from '@renderer/helpers/StringHelper'

import { useModalNavigate } from '@renderer/hooks/useModalRouter'
import { PENDING_SWAP_STATUSES } from '@renderer/hooks/useSwapOrder'

import MdRefresh from '@renderer/assets/images/md-refresh.svg?react'
import TbCircleX from '@renderer/assets/images/tb-circle-x.svg?react'
import TbMessage from '@renderer/assets/images/tb-message.svg?react'
import TbReceipt from '@renderer/assets/images/tb-receipt.svg?react'
import TbRosetteDiscountCheck from '@renderer/assets/images/tb-rosette-discount-check.svg?react'

import { SwapDetailsModalTokenDetails } from './SwapDetailsModalTokenDetails'

const stepsByStatus: Record<TSwapResult['status'], number> = {
  confirming: 2,
  exchanging: 3,
  finished: 4,
  failed: 2,
  refunded: 2,
}

type TProps = {
  orderId: string
  swapResult: TSwapResult
}

export const SwapDetailsModalContent = ({ orderId, swapResult }: TProps) => {
  const { t } = useTranslation('modals', { keyPrefix: 'swapDetails' })
  const { modalNavigate } = useModalNavigate()

  const blockchainFrom = swapResult.tokenFrom.blockchain!

  const service = BlockchainServiceHelper.bsAggregator.blockchainServicesByName[blockchainFrom]

  const handleGoToSwapLog = () => {
    modalNavigate('swap-details-log', { state: { orderId } })
  }

  return (
    <Fragment>
      <div className="bg-asphalt min-size-32 max-size-32 flex size-32 items-center justify-center rounded-full">
        {swapResult.status === 'failed' || swapResult.status === 'refunded' ? (
          <TbCircleX aria-hidden className="text-pink min-size-28 max-size-28 size-28 stroke-1" />
        ) : (
          <TbRosetteDiscountCheck aria-hidden className="text-blue min-size-28 max-size-28 size-28 stroke-1" />
        )}
      </div>

      <div className="mt-9 flex flex-col items-center gap-2.5">
        {['refunded', 'failed'].includes(swapResult.status) && (
          <p className="text-sm text-gray-300">
            {t(!swapResult.txIdFrom ? 'transferErrorMessage' : 'swapErrorMessage')}
          </p>
        )}

        <p className="text-xl text-white">{swapResult.status === 'refunded' ? t('refundedSubtitle') : t('subtitle')}</p>
      </div>

      <Separator className="mt-6 mb-8" />

      <Details.Root>
        <Details.Header
          rightElement={
            <span className="text-orange grow text-end text-sm italic">{t('detailsHeaderDescription')}</span>
          }
          leftElement={<TbReceipt aria-hidden />}
        >
          {t('detailsHeaderLabel')}
        </Details.Header>

        <Details.HeaderSeparator />

        <Details.Body>
          <Details.Panel label={t('statusPanelLabel')}>
            <Stepper.Root
              className="my-4"
              value={stepsByStatus[swapResult.status]}
              colorSchema="neon"
              state={
                ['failed', 'refunded'].includes(swapResult.status) ||
                (!PENDING_SWAP_STATUSES.includes(swapResult.status) && !swapResult.txIdFrom)
                  ? 'error'
                  : 'success'
              }
            >
              <Stepper.List>
                <Stepper.Step value={1} label={t('confirmStatusStepLabel')} />
                <Stepper.Step value={2} label={t('exchangeStatusStepLabel')} />
                <Stepper.Step value={3} label={t('completeStatusStepLabel')} />
              </Stepper.List>
            </Stepper.Root>
          </Details.Panel>

          <Details.Panel label={t('routingPanelLabel')} className="mt-6">
            {swapResult.txIdFrom && (
              <Details.Item label={t('routingPanelTransactionFromLabel')} copyable={swapResult.txIdFrom}>
                <div className="flex items-center gap-2.5">
                  <BlockchainIcon blockchain={blockchainFrom} />

                  {swapResult.tokenFrom.txTemplateUrl ? (
                    <Link
                      to={swapResult.tokenFrom.txTemplateUrl.replace('{txId}', swapResult.txIdFrom)}
                      target="_blank"
                      label={StringHelper.truncateMiddle(swapResult.txIdFrom, 20)}
                      colorSchema="white"
                      variant="text-slim"
                      textClassName="font-normal"
                      clickableProps={{ className: 'text-xs text-blue underline' }}
                    />
                  ) : (
                    <span className="text-white">{StringHelper.truncateMiddle(swapResult.txIdFrom, 20)}</span>
                  )}
                </div>
              </Details.Item>
            )}

            {!swapResult.txIdFrom && PENDING_SWAP_STATUSES.includes(swapResult.status) && (
              <Details.Item label={t('routingPanelTransactionFromLabel')}>
                <div className="text-orange flex items-center gap-1.5">
                  <span className="text-sm">{t('routingPanelTransactionToLabelPending')}</span>

                  <MdRefresh aria-hidden className="min-size-6 max-size-6 size-6 animate-spin" />
                </div>
              </Details.Item>
            )}

            {swapResult.txIdFrom &&
              (swapResult.txIdTo ||
                (swapResult.status !== 'refunded' && swapResult.status !== 'failed' && !swapResult.txIdTo)) && (
                <Details.Item label={t('routingPanelTransactionToLabel')} copyable={swapResult.txIdTo}>
                  {match({ txTo: swapResult.txIdTo })
                    .with({ txTo: P.string }, ({ txTo }) => (
                      <div className="flex items-center gap-2.5">
                        {swapResult.tokenTo.blockchain && <BlockchainIcon blockchain={swapResult.tokenTo.blockchain} />}

                        {swapResult.tokenTo.txTemplateUrl ? (
                          <Link
                            to={swapResult.tokenTo.txTemplateUrl.replace('{txId}', txTo)}
                            target="_blank"
                            label={StringHelper.truncateMiddle(txTo, 20)}
                            colorSchema="white"
                            variant="text-slim"
                            textClassName="font-normal"
                            clickableProps={{ className: 'text-xs text-blue underline' }}
                          />
                        ) : (
                          <span className="text-white">{StringHelper.truncateMiddle(txTo, 20)}</span>
                        )}
                      </div>
                    ))
                    .otherwise(() => (
                      <div className="text-orange flex items-center gap-1.5">
                        <span className="text-sm">{t('routingPanelTransactionToLabelPending')}</span>

                        <MdRefresh aria-hidden className="min-size-6 max-size-6 size-6 animate-spin" />
                      </div>
                    ))}
                </Details.Item>
              )}

            {swapResult.fee && (
              <Details.Item label={t('routingPanelTransactionFeeLabel')}>
                <SwapDetailsModalTokenDetails
                  blockchain={blockchainFrom}
                  amount={swapResult.fee}
                  symbol={service.feeToken.symbol}
                />
              </Details.Item>
            )}
          </Details.Panel>
        </Details.Body>
      </Details.Root>

      <Details.Root className="mt-2.5">
        <Details.Body className="mt-2.5">
          <Details.Panel label={t('sentPanelLabel')}>
            <Details.Item label={t('sentPanelTokenLabel')}>
              <SwapDetailsModalTokenDetails
                blockchain={blockchainFrom}
                amount={swapResult.amountFrom}
                symbol={swapResult.tokenFrom.symbol}
              />
            </Details.Item>

            <Details.Item label={t('sentPanelAddressLabel')}>
              {swapResult.tokenFrom.addressTemplateUrl ? (
                <Link
                  to={swapResult.tokenFrom.addressTemplateUrl.replace('{address}', swapResult.addressFrom)}
                  target="_blank"
                  label={StringHelper.truncateMiddle(swapResult.addressFrom, 20)}
                  colorSchema="white"
                  variant="text-slim"
                  textClassName="font-normal"
                  clickableProps={{ className: 'text-blue underline' }}
                />
              ) : (
                StringHelper.truncateMiddle(swapResult.addressFrom, 20)
              )}
            </Details.Item>
          </Details.Panel>

          <Details.Panel label={t('receivePanelLabel')}>
            <Details.Item label={t('receivePanelTokenLabel')}>
              <SwapDetailsModalTokenDetails
                blockchain={swapResult.tokenTo.blockchain}
                amount={swapResult.amountTo}
                symbol={swapResult.tokenTo.symbol}
              />
            </Details.Item>

            <Details.Item label={t('receivePanelAddressLabel')}>
              {swapResult.tokenTo.addressTemplateUrl ? (
                <Link
                  to={swapResult.tokenTo.addressTemplateUrl.replace('{address}', swapResult.addressTo)}
                  target="_blank"
                  label={StringHelper.truncateMiddle(swapResult.addressTo, 20)}
                  colorSchema="white"
                  variant="text-slim"
                  textClassName="font-normal"
                  clickableProps={{ className: 'text-blue underline' }}
                />
              ) : (
                StringHelper.truncateMiddle(swapResult.addressTo, 20)
              )}
            </Details.Item>

            {swapResult.extraIdTo && <Details.Item label={t('extraIdToLabel')}>{swapResult.extraIdTo}</Details.Item>}
          </Details.Panel>
        </Details.Body>
      </Details.Root>

      <div className="mt-8 flex w-full items-center gap-2 px-4">
        <Button
          label={t('swapLog')}
          className="w-40"
          textClassName="text-gray-100"
          flat
          wide
          onClick={handleGoToSwapLog}
        />

        <Button
          label={t('helpButtonLabel')}
          className="grow"
          flat
          wide
          iconsOnEdge={false}
          rightIcon={<TbMessage aria-hidden />}
          onClick={CrispHelper.open}
        />
      </div>
    </Fragment>
  )
}
