import { useState } from 'react'

import { BSError } from '@cityofzion/blockchain-service'
import { Neo3NeoXBridgeOrchestrator } from '@cityofzion/bs-multichain'
import { BSNeo3 } from '@cityofzion/bs-neo3'
import { BSNeoX } from '@cityofzion/bs-neox'
import { useTranslation } from 'react-i18next'

import { Details } from '@renderer/components/Details'
import { Link } from '@renderer/components/Link'
import { Separator } from '@renderer/components/Separator'
import { Stepper } from '@renderer/components/Stepper'
import { TokenDetails } from '@renderer/components/TokenDetails'

import { BlockchainServiceHelper } from '@renderer/helpers/BlockchainServiceHelper'
import { ConstantsHelper } from '@renderer/helpers/ConstantsHelper'

import { useModalState } from '@renderer/hooks/useModalRouter'
import { useMountUnsafe } from '@renderer/hooks/useMount'

import { SideModalLayout } from '@renderer/layouts/SideModal'

import MdRefresh from '@renderer/assets/images/md-refresh.svg?react'
import TbExternalLink from '@renderer/assets/images/tb-external-link.svg?react'
import TbReceipt from '@renderer/assets/images/tb-receipt.svg?react'
import TbReplace2 from '@renderer/assets/images/tb-replace-2.svg?react'
import TbRosetteDiscountCheck from '@renderer/assets/images/tb-rosette-discount-check.svg?react'

import { TBlockchainServiceKey } from '@shared/types/blockchain'
import type { TModalState } from '@shared/types/modal'

type TBridgeStatus = 'confirming' | 'completed' | 'error'

const stepsByStatus: Record<TBridgeStatus, number> = {
  confirming: 1,
  completed: 3,
  error: 2,
}

const Neo3NeoxBridgeDetailsModal = () => {
  const {
    accountToUse,
    addressToReceive,
    amountToUse,
    amountToReceive,
    tokenToReceive,
    tokenToUse,
    transactionHash,
    confirmed,
  } = useModalState<TModalState<'neo3-neox-bridge-details'>>()
  const { t } = useTranslation('modals', { keyPrefix: 'neo3NeoxBridgeDetails' })

  const [status, setStatus] = useState<TBridgeStatus>('confirming')
  const [errorMessage, setErrorMessage] = useState<string>()

  useMountUnsafe(() => {
    if (!transactionHash || confirmed === false) {
      setStatus('error')
      return
    }

    if (confirmed === true) {
      setStatus('completed')
      return
    }

    Neo3NeoXBridgeOrchestrator.wait({
      tokenToUse,
      tokenToReceive,
      transactionHash,
      neo3Service: BlockchainServiceHelper.bsAggregator.blockchainServicesByName.neo3 as BSNeo3<TBlockchainServiceKey>,
      neoXService: BlockchainServiceHelper.bsAggregator.blockchainServicesByName.neox as BSNeoX<TBlockchainServiceKey>,
    })
      .then(() => {
        setStatus('completed')
      })
      .catch(error => {
        console.error(error)
        setStatus('error')
        setErrorMessage(
          error instanceof BSError
            ? t(`errorsByCode.${error.code}`, t('errorsByCode.UNEXPECTED_ERROR'))
            : t('errorsByCode.UNEXPECTED_ERROR')
        )
      })
  })

  return (
    <SideModalLayout
      heading={t('title')}
      headingIcon={<TbReplace2 aria-hidden />}
      contentClassName="flex flex-col items-center overflow-auto"
      size="lg"
    >
      <TbRosetteDiscountCheck aria-hidden className="text-blue min-h-28 min-w-28 stroke-1" />

      <p className="mt-9 text-xl text-white">{t('description')}</p>

      <Separator className="mt-6 mb-8" />

      <Details.Root className="gap-y-2">
        <Details.Header
          rightElement={
            status === 'confirming' ? <MdRefresh aria-hidden className="text-orange h-6 w-6 animate-spin" /> : undefined
          }
          leftElement={<TbReceipt aria-hidden />}
        >
          {t('detailsHeaderLabel')}
        </Details.Header>

        <Details.Body>
          <Details.Panel label={t('statusPanelLabel')}>
            <Stepper.Root
              className="mt-4 mb-10 px-14"
              value={stepsByStatus[status]}
              state={status == 'error' ? 'error' : 'success'}
              colorSchema="neon"
            >
              <Stepper.List>
                <Stepper.Step value={1} label={t('sendStepLabel')} />
                <Stepper.Step value={2} label={t('completeStepLabel')} />
              </Stepper.List>
            </Stepper.Root>

            {errorMessage && <p className="text-pink text-center text-xs">{errorMessage}</p>}
          </Details.Panel>
        </Details.Body>
      </Details.Root>

      <Details.Root className="mt-2.5">
        <Details.Body>
          <Details.Panel label={t('fromDetailsPanelLabel')}>
            <Details.Item label={t('fromTokenDetailsItemLabel')}>
              <TokenDetails symbol={tokenToUse.symbol} blockchain={tokenToUse.blockchain} amount={amountToUse} />
            </Details.Item>

            <Details.Item label={t('fromAddressDetailsItemLabel')}>{accountToUse.address}</Details.Item>
          </Details.Panel>

          <Details.Panel label={t('toDetailsPanelLabel')}>
            <Details.Item label={t('toTokenDetailsItemLabel')}>
              <TokenDetails
                symbol={tokenToReceive.symbol}
                blockchain={tokenToReceive.blockchain}
                amount={amountToReceive}
              />
            </Details.Item>

            <Details.Item label={t('toAddressDetailsItemLabel')}>{addressToReceive}</Details.Item>
          </Details.Panel>
        </Details.Body>
      </Details.Root>

      <div className="mt-8 flex w-full items-center gap-2 px-4">
        <Link
          label={t('helpButtonLabel')}
          className="grow"
          target="_blank"
          to={ConstantsHelper.cozDiscordUrl}
          flat
          wide
          iconsOnEdge={false}
          rightIcon={<TbExternalLink aria-hidden />}
        />
      </div>
    </SideModalLayout>
  )
}

export default Neo3NeoxBridgeDetailsModal
