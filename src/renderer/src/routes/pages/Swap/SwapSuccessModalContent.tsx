import { Fragment, ReactNode, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { TbReceipt } from 'react-icons/tb'
import { SwapService, SwapServiceStatusResponse } from '@cityofzion/blockchain-service'
import { Loader } from '@renderer/components/Loader'
import { Separator } from '@renderer/components/Separator'
import { bsAggregator } from '@renderer/libs/blockchainService'
import { TBlockchainServiceKey } from '@shared/@types/blockchain'
import { TSwapRecord } from '@shared/@types/store'

type TProps = {
  swapService: SwapService<TBlockchainServiceKey>
  swapRecord: TSwapRecord
}

type TItemProps = {
  label: string
  value: ReactNode
}
const Item = ({ label, value }: TItemProps) => {
  return (
    <div className="flex flex-col gap-2.5 py-4 px-3">
      <span className="text-xs text-gray-100 uppercase">{label}</span>

      <span className="text-sm text-white break-all pr-16">{value}</span>
    </div>
  )
}

export const SwapSuccessModalContent = ({ swapRecord, swapService }: TProps) => {
  const { t } = useTranslation('pages', { keyPrefix: 'swap.form.sendSuccess' })
  const [statusResponse, setStatusResponse] = useState<SwapServiceStatusResponse>({
    status: swapRecord.swapStatus,
    transactionHashes: swapRecord.transactionHashes,
  })

  const timeoutRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    const getStatus = async () => {
      let response: SwapServiceStatusResponse | undefined
      try {
        response = await swapService.getStatus()
        setStatusResponse(response)
      } catch {
        // Empty block
      }

      if (response && response.status === 'finished') {
        clearTimeout(timeoutRef.current)
        return
      }

      timeoutRef.current = setTimeout(getStatus, 2500)
    }

    timeoutRef.current = setTimeout(getStatus, 0)

    return () => {
      clearTimeout(timeoutRef.current)
    }
  }, [swapService])

  return (
    <div className="flex flex-col w-full items-center flex-grow min-h-0 justify-between gap-8">
      <div className="flex flex-col fle-grow  min-h-0  py-1.5 bg-asphalt mt-6 rounded">
        <div className="flex flex-col flex-grow w-full min-h-0 px-4 py-1.5 overflow-auto">
          <div className="flex text-sm text-white items-center  gap-2.5">
            <TbReceipt className="text-blue w-6 h-6" />
            <span>{t('detailsTitle')}</span>
          </div>

          <Separator className="mt-2.5" />

          <div className="flex flex-col">
            <Item
              label={t('statusLabel')}
              value={
                <div className="flex gap-2.5 items-center">
                  {statusResponse.status}
                  {statusResponse.status !== 'finished' && statusResponse.status !== 'failed' && (
                    <Loader containerClassName="w-min" className="w-4 h-4" />
                  )}
                </div>
              }
            />

            <Separator />

            <Item label={t('recipientLabel')} value={swapRecord.addressTo} />

            <Separator />

            <Item
              label={t('amountFrom')}
              value={
                <div className="flex gap-1">
                  {swapRecord.amountFrom}
                  <span className="text-gray-100 uppercase">{swapRecord.tokenFrom.symbol}</span>
                </div>
              }
            />

            <Separator />

            <Item
              label={t('amountTo')}
              value={
                <div className="flex gap-1">
                  {swapRecord.amountTo}
                  <span className="text-gray-100 uppercase">{swapRecord.tokenTo.symbol}</span>
                </div>
              }
            />

            <Separator />

            {swapRecord.fee && (
              <Item
                label={t('feeLabel')}
                value={
                  <Fragment>
                    {swapRecord.fee}
                    <span className="text-gray-100 uppercase">
                      {bsAggregator.blockchainServicesByName[swapRecord.account.blockchain].feeToken.symbol}
                    </span>
                  </Fragment>
                }
              />
            )}

            <Separator />

            {statusResponse.transactionHashes.map((hash, index, array) => {
              const label =
                index === 0
                  ? t('transactionFromLabel')
                  : index + 1 === array.length
                    ? t('transactionToLabel')
                    : t('transactionAux')

              return (
                <Fragment key={hash}>
                  <Item label={label} value={hash} />

                  {index + 1 !== array.length && <Separator />}
                </Fragment>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
