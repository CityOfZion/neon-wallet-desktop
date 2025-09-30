import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { BSError, TBridgeToken } from '@cityofzion/blockchain-service'
import { Neo3NeoXBridgeOrchestrator } from '@cityofzion/bs-multichain'
import { BSNeo3 } from '@cityofzion/bs-neo3'
import { BSNeoX } from '@cityofzion/bs-neox'
import MdLaunch from '@renderer/assets/images/md-launch.svg?react'
import MdRefresh from '@renderer/assets/images/md-refresh.svg?react'
import TbReceipt from '@renderer/assets/images/tb-receipt.svg?react'
import TbReplace2 from '@renderer/assets/images/tb-replace-2.svg?react'
import TbRosetteDiscountCheck from '@renderer/assets/images/tb-rosette-discount-check.svg?react'
import { Details } from '@renderer/components/Details'
import { Link } from '@renderer/components/Link'
import { Separator } from '@renderer/components/Separator'
import { Stepper } from '@renderer/components/Stepper'
import { TokenDetails } from '@renderer/components/TokenDetails'
import { DISCORD_LINK } from '@renderer/constants/urls'
import { useModalState } from '@renderer/hooks/useModalRouter'
import { useMountUnsafe } from '@renderer/hooks/useMount'
import { SideModalLayout } from '@renderer/layouts/SideModal'
import { bsAggregator } from '@renderer/libs/blockchainService'
import { TBlockchainServiceKey } from '@shared/@types/blockchain'
import { IAccountState } from '@shared/@types/store'

type TState = {
  tokenToUse: TBridgeToken<TBlockchainServiceKey>
  tokenToReceive: TBridgeToken<TBlockchainServiceKey>
  accountToUse: IAccountState
  amountToUse: string
  amountToReceive: string
  addressToReceive: string
  transactionHash?: string
  confirmed?: boolean
}

type TBridgeStatus = 'confirming' | 'completed' | 'error'

const stepsByStatus: Record<TBridgeStatus, number> = {
  confirming: 1,
  completed: 3,
  error: 2,
}

export const Neo3NeoxBridgeDetailsModal = () => {
  const {
    accountToUse,
    addressToReceive,
    amountToUse,
    amountToReceive,
    tokenToReceive,
    tokenToUse,
    transactionHash,
    confirmed,
  } = useModalState<TState>()
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
      neo3Service: bsAggregator.blockchainServicesByName.neo3 as BSNeo3<TBlockchainServiceKey>,
      neoXService: bsAggregator.blockchainServicesByName.neox as BSNeoX<TBlockchainServiceKey>,
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
    >
      <TbRosetteDiscountCheck aria-hidden className="min-h-28 min-w-28 stroke-1 text-blue" />

      <p className="mt-9 text-xl text-white">{t('description')}</p>

      <Separator className="mb-8 mt-6" />

      <Details.Root>
        <Details.Header label={t('detailsHeaderLabel')} icon={<TbReceipt aria-hidden />}>
          {status === 'confirming' && <MdRefresh aria-hidden className="h-6 w-6 animate-spin text-orange" />}
        </Details.Header>

        <Details.Body>
          <Details.Panel label={t('statusPanelLabel')}>
            <Stepper
              className="mb-10 mt-4 px-14"
              steps={t('statusPanelSteps', { returnObjects: true })}
              currentStep={stepsByStatus[status]}
              currentState={status == 'error' ? 'error' : 'success'}
              theme="neon"
            />

            {errorMessage && <p className="text-center text-xs text-pink">{errorMessage}</p>}
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
          className="flex-grow"
          target="_blank"
          to={DISCORD_LINK}
          flat
          wide
          iconsOnEdge={false}
          rightIcon={<MdLaunch aria-hidden />}
        />
      </div>
    </SideModalLayout>
  )
}
