import { Fragment, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { SimpleSwapService } from '@cityofzion/bs-multichain'
import MdLaunch from '@renderer/assets/images/md-launch.svg?react'
import MdRefresh from '@renderer/assets/images/md-refresh.svg?react'
import TbCircleX from '@renderer/assets/images/tb-circle-x.svg?react'
import TbReceipt from '@renderer/assets/images/tb-receipt.svg?react'
import TbReplace from '@renderer/assets/images/tb-replace.svg?react'
import TbRosetteDiscountCheck from '@renderer/assets/images/tb-rosette-discount-check.svg?react'
import { BlockchainIcon } from '@renderer/components/BlockchainIcon'
import { Button } from '@renderer/components/Button'
import { Details } from '@renderer/components/Details'
import { Link } from '@renderer/components/Link'
import { Separator } from '@renderer/components/Separator'
import { Stepper, TStepperCurrentState } from '@renderer/components/Stepper'
import { DISCORD_LINK } from '@renderer/constants/urls'
import { StringHelper } from '@renderer/helpers/StringHelper'
import { useModalNavigate, useModalState } from '@renderer/hooks/useModalRouter'
import { useAppDispatch } from '@renderer/hooks/useRedux'
import { SideModalLayout } from '@renderer/layouts/SideModal'
import { bsAggregator } from '@renderer/libs/blockchainService'
import { utilityReducerActions } from '@renderer/store/reducers/UtilityReducer'
import { TSwapRecord } from '@shared/@types/store'
import { match, P } from 'ts-pattern'

import { SwapDetailsModalTokenDetails } from './SwapDetailsModalTokenDetails'

type TState = {
  swapRecord: TSwapRecord
}

const swapService = new SimpleSwapService()

const stepsByStatus: Record<TSwapRecord['swapStatus'], number> = {
  confirming: 2,
  exchanging: 3,
  finished: 4,
  failed: 2,
  refunded: 2,
}

export const SwapDetailsModal = () => {
  const modalState = useModalState<TState>()
  const dispatch = useAppDispatch()
  const { t } = useTranslation('modals', { keyPrefix: 'swapDetails' })
  const { modalNavigate } = useModalNavigate()

  const [swapRecord, setSwapRecord] = useState<TSwapRecord>(modalState.swapRecord)

  const timeoutRef = useRef<NodeJS.Timeout>()

  const service = bsAggregator.blockchainServicesByName[swapRecord.account.blockchain]

  const handleGoToSwapLog = () => {
    modalNavigate('swap-details-log', { state: { swapRecord } })
  }

  useEffect(() => {
    const getStatus = async () => {
      if (!swapRecord.swapId || !['confirming', 'exchanging'].includes(swapRecord.swapStatus)) return

      try {
        const response = await swapService.getStatus(swapRecord.swapId)
        const { status, log } = response
        let { txFrom, txTo } = response

        if (!txFrom) txFrom = swapRecord.txFrom
        if (!txTo) txTo = swapRecord.txTo

        const updatedSwapRecord: TSwapRecord = { ...swapRecord, txFrom, txTo, swapStatus: status, log }

        setSwapRecord(updatedSwapRecord)
        dispatch(utilityReducerActions.persistSwapRecord(updatedSwapRecord))

        if (status === 'finished') {
          clearTimeout(timeoutRef.current)

          return
        }
      } catch {
        // Empty block
      }

      timeoutRef.current = setTimeout(getStatus, 2000)
    }

    timeoutRef.current = setTimeout(getStatus, 100)

    return () => {
      clearTimeout(timeoutRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <SideModalLayout
      heading={t('title')}
      headingIcon={<TbReplace aria-hidden={true} />}
      contentClassName="flex flex-col items-center overflow-auto"
    >
      <div className="flex h-28 w-28 items-center rounded-full bg-asphalt p-2">
        {swapRecord.swapStatus === 'failed' || swapRecord.swapStatus === 'refunded' ? (
          <TbCircleX aria-hidden={true} className="h-28 w-28 stroke-1 text-pink" />
        ) : (
          <TbRosetteDiscountCheck aria-hidden={true} className="h-28 w-28 stroke-1 text-blue" />
        )}
      </div>

      <div className="mt-9 flex flex-col items-center gap-2.5">
        {match({ swapStatus: swapRecord.swapStatus, txFrom: swapRecord.txFrom })
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
          {match({ swapStatus: swapRecord.swapStatus })
            .with({ swapStatus: 'refunded' }, () => t('refundedSubtitle'))
            .otherwise(() => t('subtitle'))}
        </p>
      </div>

      <Separator className="mb-8 mt-6" />

      <Details.Root>
        <Details.Header label={t('detailsHeaderLabel')} icon={<TbReceipt />}>
          <span className="tet-sm flex-grow text-end italic text-orange">{t('detailsHeaderDescription')}</span>
        </Details.Header>

        <Details.Body>
          <Details.Panel label={t('statusPanelLabel')}>
            <Stepper
              className="mt-4 px-14"
              steps={t('statusPanelSteps', { returnObjects: true })}
              currentStep={stepsByStatus[swapRecord.swapStatus]}
              currentState={match({ swapStatus: swapRecord.swapStatus, txFrom: swapRecord.txFrom })
                .returnType<TStepperCurrentState>()
                .with({ swapStatus: P.union('failed', 'refunded') }, () => 'error')
                .with({ txFrom: P.nullish }, () => 'error')
                .otherwise(() => 'success')}
              theme="neon"
            />
          </Details.Panel>

          <Details.Panel label={t('routingPanelLabel')} className="mt-6">
            {swapRecord.txFrom && (
              <Details.Item label={t('routingPanelTransactionFromLabel')} copyable={swapRecord.txFrom}>
                <div className="flex items-center gap-2.5">
                  <BlockchainIcon blockchain={swapRecord.tokenFrom.blockchain!} />

                  {swapRecord.tokenFrom.txTemplateUrl ? (
                    <Link
                      to={swapRecord.tokenFrom.txTemplateUrl.replace('{txId}', swapRecord.txFrom)}
                      target="_blank"
                      label={StringHelper.truncateStringMiddle(swapRecord.txFrom, 20)}
                      colorSchema="white"
                      variant="text-slim"
                      textClassName="font-normal"
                      clickableProps={{ className: 'text-xs text-blue underline' }}
                    />
                  ) : (
                    <span className="text-white">{StringHelper.truncateStringMiddle(swapRecord.txFrom, 20)}</span>
                  )}
                </div>
              </Details.Item>
            )}

            {swapRecord.txFrom &&
              (swapRecord.txTo ||
                (swapRecord.swapStatus !== 'refunded' && swapRecord.swapStatus !== 'failed' && !swapRecord.txTo)) && (
                <Details.Item label={t('routingPanelTransactionToLabel')} copyable={swapRecord.txTo}>
                  {match({ txTo: swapRecord.txTo })
                    .with({ txTo: P.string }, ({ txTo }) => (
                      <div className="flex items-center gap-2.5">
                        {swapRecord.tokenTo.blockchain && <BlockchainIcon blockchain={swapRecord.tokenTo.blockchain} />}

                        {swapRecord.tokenTo.txTemplateUrl ? (
                          <Link
                            to={swapRecord.tokenTo.txTemplateUrl.replace('{txId}', txTo)}
                            target="_blank"
                            label={StringHelper.truncateStringMiddle(txTo, 20)}
                            colorSchema="white"
                            variant="text-slim"
                            textClassName="font-normal"
                            clickableProps={{ className: 'text-xs text-blue underline' }}
                          />
                        ) : (
                          <span className="text-white">{StringHelper.truncateStringMiddle(txTo, 20)}</span>
                        )}
                      </div>
                    ))
                    .otherwise(() => (
                      <div className="flex items-center gap-1.5 text-orange">
                        <span className="text-sm">{t('routingPanelTransactionToLabelPending')}</span>

                        <MdRefresh aria-hidden={true} className="h-6 w-6 animate-spin" />
                      </div>
                    ))}
                </Details.Item>
              )}

            {swapRecord.fee && (
              <Details.Item label={t('routingPanelTransactionFeeLabel')}>
                <SwapDetailsModalTokenDetails
                  blockchain={swapRecord.account.blockchain}
                  amount={swapRecord.fee}
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
                blockchain={swapRecord.tokenFrom.blockchain!}
                amount={swapRecord.amountFrom}
                symbol={swapRecord.tokenFrom.symbol}
              />
            </Details.Item>

            <Details.Item label={t('sentPanelAddressLabel')}>
              {swapRecord.tokenFrom.addressTemplateUrl ? (
                <Link
                  to={swapRecord.tokenFrom.addressTemplateUrl.replace('{address}', swapRecord.account.address)}
                  target="_blank"
                  label={swapRecord.account.address}
                  colorSchema="white"
                  variant="text-slim"
                  textClassName="font-normal"
                  clickableProps={{ className: 'text-blue underline' }}
                />
              ) : (
                swapRecord.account.address
              )}
            </Details.Item>
          </Details.Panel>

          <Details.Panel label={t('receivePanelLabel')}>
            <Details.Item label={t('receivePanelTokenLabel')}>
              <SwapDetailsModalTokenDetails
                blockchain={swapRecord.tokenTo.blockchain}
                amount={swapRecord.amountTo}
                symbol={swapRecord.tokenTo.symbol}
              />
            </Details.Item>

            <Details.Item label={t('receivePanelAddressLabel')}>
              {swapRecord.tokenTo.addressTemplateUrl ? (
                <Link
                  to={swapRecord.tokenTo.addressTemplateUrl.replace('{address}', swapRecord.addressTo)}
                  target="_blank"
                  label={swapRecord.addressTo}
                  colorSchema="white"
                  variant="text-slim"
                  textClassName="font-normal"
                  clickableProps={{ className: 'text-blue underline' }}
                />
              ) : (
                swapRecord.addressTo
              )}
            </Details.Item>

            {swapRecord.extraIdTo && <Details.Item label={t('extraIdToLabel')}>{swapRecord.extraIdTo}</Details.Item>}
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

        <Link
          label={t('helpButtonLabel')}
          className="flex-grow"
          target="_blank"
          to={DISCORD_LINK}
          flat
          wide
          iconsOnEdge={false}
          rightIcon={<MdLaunch aria-hidden={true} />}
        />
      </div>
    </SideModalLayout>
  )
}
