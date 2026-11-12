import { Fragment } from 'react'

import type { TSwapResult } from '@cityofzion/bs-multichain'
import { useTranslation } from 'react-i18next'
import { match, P } from 'ts-pattern'

import { BlockchainIcon } from '@renderer/components/BlockchainIcon'
import { Button } from '@renderer/components/Button'
import { Details } from '@renderer/components/Details'
import { Link } from '@renderer/components/Link'
import { Loader } from '@renderer/components/Loader'
import { Separator } from '@renderer/components/Separator'
import { Stepper, TStepperState } from '@renderer/components/Stepper'

import { BlockchainServiceHelper } from '@renderer/helpers/BlockchainServiceHelper'
import { CrispHelper } from '@renderer/helpers/CrispHelper'
import { StringHelper } from '@renderer/helpers/StringHelper'

import { useModalNavigate, useModalState } from '@renderer/hooks/useModalRouter'
import { PENDING_SWAP_STATUSES, useSwapOrder } from '@renderer/hooks/useSwapOrder'

import { SideModalLayout } from '@renderer/layouts/SideModal'

import MdRefresh from '@renderer/assets/images/md-refresh.svg?react'
import TbCircleX from '@renderer/assets/images/tb-circle-x.svg?react'
import TbMessage from '@renderer/assets/images/tb-message.svg?react'
import TbReceipt from '@renderer/assets/images/tb-receipt.svg?react'
import TbReplace from '@renderer/assets/images/tb-replace.svg?react'
import TbRosetteDiscountCheck from '@renderer/assets/images/tb-rosette-discount-check.svg?react'

import type { TModalState } from '@shared/types/modal'

import { SwapDetailsModalTokenDetails } from './SwapDetailsModalTokenDetails'

const stepsByStatus: Record<TSwapResult['status'], number> = {
  confirming: 2,
  exchanging: 3,
  finished: 4,
  failed: 2,
  refunded: 2,
}

type TContentProps = {
  orderId: string
  swapResult: TSwapResult
}

const SwapDetailsModalContent = ({ orderId, swapResult }: TContentProps) => {
  const { t } = useTranslation('modals', { keyPrefix: 'swapDetails' })
  const { modalNavigate } = useModalNavigate()

  const blockchainFrom = swapResult.tokenFrom.blockchain!

  const service = BlockchainServiceHelper.bsAggregator.blockchainServicesByName[blockchainFrom]

  const handleGoToSwapLog = () => {
    modalNavigate('swap-details-log', { state: { orderId } })
  }

  return (
    <Fragment>
      <div className="bg-asphalt flex h-28 w-28 items-center rounded-full p-2">
        {swapResult.status === 'failed' || swapResult.status === 'refunded' ? (
          <TbCircleX aria-hidden className="text-pink h-28 w-28 stroke-1" />
        ) : (
          <TbRosetteDiscountCheck aria-hidden className="text-blue h-28 w-28 stroke-1" />
        )}
      </div>

      <div className="mt-9 flex flex-col items-center gap-2.5">
        {match({ swapStatus: swapResult.status, txFrom: swapResult.txIdFrom })
          .with({ swapStatus: P.union('refunded', 'failed'), txFrom: P.nullish }, () => (
            <p className="text-sm text-gray-300">{t('transferErrorMessage')}</p>
          ))
          .with({ swapStatus: P.union('refunded', 'failed'), txFrom: P.string }, () => (
            <p className="text-sm text-gray-300">{t('swapErrorMessage')}</p>
          ))
          .otherwise(() => (
            <Fragment />
          ))}

        <p className="text-xl text-white">
          {match({ swapStatus: swapResult.status })
            .with({ swapStatus: 'refunded' }, () => t('refundedSubtitle'))
            .otherwise(() => t('subtitle'))}
        </p>
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
              state={match({ swapStatus: swapResult.status, txFrom: swapResult.txIdFrom })
                .returnType<TStepperState>()
                .with({ swapStatus: P.union('failed', 'refunded') }, () => 'error')
                .with(
                  { swapStatus: P.when(status => !PENDING_SWAP_STATUSES.includes(status)), txFrom: P.nullish },
                  () => 'error'
                )
                .otherwise(() => 'success')}
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

                        <MdRefresh aria-hidden className="h-6 w-6 animate-spin" />
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
                  label={swapResult.addressFrom}
                  colorSchema="white"
                  variant="text-slim"
                  textClassName="font-normal"
                  clickableProps={{ className: 'text-blue underline' }}
                />
              ) : (
                swapResult.addressFrom
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
                  label={swapResult.addressTo}
                  colorSchema="white"
                  variant="text-slim"
                  textClassName="font-normal"
                  clickableProps={{ className: 'text-blue underline' }}
                />
              ) : (
                swapResult.addressTo
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

const SwapDetailsModal = () => {
  const { t } = useTranslation('modals', { keyPrefix: 'swapDetails' })
  const { orderId } = useModalState<TModalState<'swap-details'>>()

  const swapOrderQuery = useSwapOrder(orderId)

  return (
    <SideModalLayout
      heading={t('title')}
      headingIcon={<TbReplace aria-hidden />}
      contentClassName="flex flex-col items-center overflow-auto"
      size="lg"
    >
      {match(swapOrderQuery)
        .with({ isLoading: true }, () => <Loader className="min-size-8 max-size-8 size-8" />)
        .with({ data: P.nonNullable }, ({ data }) => <SwapDetailsModalContent orderId={orderId} swapResult={data} />)
        .otherwise(() => (
          <p className="w-full text-center text-lg font-medium text-gray-300">{t('notFound')}</p>
        ))}
    </SideModalLayout>
  )
}

export default SwapDetailsModal
