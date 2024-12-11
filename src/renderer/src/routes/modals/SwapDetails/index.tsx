import { Fragment, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { MdLaunch, MdRefresh } from 'react-icons/md'
import { TbCircleX, TbDiscountCheck, TbReceipt, TbReplace } from 'react-icons/tb'
import { SimpleSwapServiceHelper } from '@cityofzion/bs-swap'
import { BlockchainIcon } from '@renderer/components/BlockchainIcon'
import { Details } from '@renderer/components/Details'
import { Link } from '@renderer/components/Link'
import { Separator } from '@renderer/components/Separator'
import { Stepper, TStepperCurrentState } from '@renderer/components/Stepper'
import { DISCORD_LINK } from '@renderer/constants/urls'
import { StringHelper } from '@renderer/helpers/StringHelper'
import { useModalState } from '@renderer/hooks/useModalRouter'
import { useAppDispatch } from '@renderer/hooks/useRedux'
import { SideModalLayout } from '@renderer/layouts/SideModal'
import { bsAggregator } from '@renderer/libs/blockchainService'
import { authReducerActions } from '@renderer/store/reducers/AuthReducer'
import { TSwapRecord } from '@shared/@types/store'
import { match, P } from 'ts-pattern'

import { SwapDetailsModalTokenDetails } from './SwapDetailsModalTokenDetails'

type TState = {
  swapRecord: TSwapRecord
}

const swapServiceHelper = new SimpleSwapServiceHelper()

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

  const [swapRecord, setSwapRecord] = useState<TSwapRecord>(modalState.swapRecord)

  const timeoutRef = useRef<NodeJS.Timeout>()

  const service = bsAggregator.blockchainServicesByName[swapRecord.account.blockchain]

  useEffect(() => {
    const getStatus = async () => {
      if (!swapRecord.swapId) return

      try {
        const response = await swapServiceHelper.getStatus(swapRecord.swapId)

        const updatedSwapRecord: TSwapRecord = { ...swapRecord, swapStatus: response.status, txTo: response.txTo }

        setSwapRecord(updatedSwapRecord)
        dispatch(authReducerActions.persistSwapRecord(updatedSwapRecord))

        if (response && response.status === 'finished') {
          clearTimeout(timeoutRef.current)
          return
        }
      } catch {
        // Empty block
      }

      timeoutRef.current = setTimeout(getStatus, 2500)
    }

    if ((swapRecord.swapStatus === 'confirming' || swapRecord.swapStatus === 'exchanging') && swapRecord.swapId)
      timeoutRef.current = setTimeout(getStatus, 0)

    return () => {
      clearTimeout(timeoutRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <SideModalLayout
      heading={t('title')}
      headingIcon={<TbReplace />}
      contentClassName="flex flex-col items-center overflow-auto"
    >
      <div className="w-28 h-28 p-2 bg-asphalt rounded-full flex items-center">
        {swapRecord.swapStatus === 'failed' || swapRecord.swapStatus === 'refunded' ? (
          <TbCircleX className="w-28 h-28 stroke-1 text-pink" />
        ) : (
          <TbDiscountCheck className="w-28 h-28 stroke-1 text-blue" />
        )}
      </div>

      <div className="mt-9 flex flex-col gap-2.5 items-center">
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

      <Separator className="mt-6 mb-8" />

      <Details.Root>
        <Details.Header label={t('detailsHeaderLabel')} icon={<TbReceipt />}>
          <span className="text-end flex-grow tet-sm italic text-orange">{t('detailsHeaderDescription')}</span>
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
              <Details.Item label={t('routingPanelTransactionFromLabel')} copyable>
                <div className="flex gap-2.5 items-center">
                  <BlockchainIcon blockchain={swapRecord.tokenFrom.blockchain!} />
                  <span className="text-white">{StringHelper.truncateStringMiddle(swapRecord.txFrom, 20)}</span>
                </div>
              </Details.Item>
            )}

            {swapRecord.txFrom &&
              (swapRecord.txTo ||
                (swapRecord.swapStatus !== 'refunded' && swapRecord.swapStatus !== 'failed' && !swapRecord.txTo)) && (
                <Details.Item label={t('routingPanelTransactionToLabel')} copyable={!!swapRecord.txTo}>
                  {match({ txTo: swapRecord.txTo })
                    .with({ txTo: P.string }, ({ txTo }) => (
                      <div className="flex gap-2.5 items-center">
                        {swapRecord.tokenTo.blockchain && <BlockchainIcon blockchain={swapRecord.tokenTo.blockchain} />}
                        <span className="text-white"> {StringHelper.truncateStringMiddle(txTo, 20)}</span>
                      </div>
                    ))
                    .otherwise(() => (
                      <div className="flex gap-1.5 text-orange items-center">
                        <span className="text-sm">{t('routingPanelTransactionToLabelPending')}</span>
                        <MdRefresh className="w-6 h-6 animate-spin" />
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

            <Details.Item label={t('sentPanelAddressLabel')}>{swapRecord.account.address}</Details.Item>
          </Details.Panel>

          <Details.Panel label={t('receivePanelLabel')}>
            <Details.Item label={t('receivePanelTokenLabel')}>
              <SwapDetailsModalTokenDetails
                blockchain={swapRecord.tokenTo.blockchain}
                amount={swapRecord.amountTo}
                symbol={swapRecord.tokenTo.symbol}
              />
            </Details.Item>

            <Details.Item label={t('receivePanelAddressLabel')}>{swapRecord.addressTo}</Details.Item>
          </Details.Panel>
        </Details.Body>
      </Details.Root>

      <Link
        to={DISCORD_LINK}
        target="_blank"
        className="mt-8"
        label={t('helpButtonLabel')}
        flat
        rightIcon={<MdLaunch />}
        wide
      />
    </SideModalLayout>
  )
}
