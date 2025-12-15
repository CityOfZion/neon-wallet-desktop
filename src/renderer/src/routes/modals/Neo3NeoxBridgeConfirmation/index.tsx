import { useTranslation } from 'react-i18next'

import { Button } from '@renderer/components/Button'
import { Details } from '@renderer/components/Details'
import { TokenDetails } from '@renderer/components/TokenDetails'

import { useModalState } from '@renderer/hooks/useModalRouter'
import { usePressOnce } from '@renderer/hooks/usePressOnce'

import { SideModalLayout } from '@renderer/layouts/SideModal'

import MdCheck from '@renderer/assets/images/md-check.svg?react'
import TbArrowRight from '@renderer/assets/images/tb-arrow-right.svg?react'
import TbReceipt from '@renderer/assets/images/tb-receipt.svg?react'
import TbReplace2 from '@renderer/assets/images/tb-replace-2.svg?react'

import type { TModalState } from '@shared/types/modal'

const Neo3NeoxBridgeConfirmationModal = () => {
  const {
    accountToUse,
    addressToReceive,
    bridgeFee,
    onConfirm,
    amountToUse,
    amountToReceive,
    tokenToReceive,
    tokenToUse,
    fromService,
  } = useModalState<TModalState<'neo3-neox-bridge-confirmation'>>()
  const { t } = useTranslation('modals', { keyPrefix: 'neo3NeoxBridgeConfirmation' })

  const [isConfirming, startConfirm] = usePressOnce(onConfirm)

  return (
    <SideModalLayout
      heading={t('title')}
      headingIcon={<TbReplace2 aria-hidden />}
      contentClassName="flex flex-col overflow-y-auto"
      size="lg"
    >
      <p className="text-xs text-white">{t('description')}</p>

      <Details.Root className="mt-9">
        <Details.Header leftElement={<TbReceipt aria-hidden />}>{t('transactionDetailsHeaderLabel')}</Details.Header>

        <Details.Body>
          <Details.Panel>
            <Details.Item label={t('bridgeDetailsItemLabel')}>
              <TokenDetails symbol={tokenToUse.symbol} blockchain={tokenToUse.blockchain} className="w-fit" />

              <TbArrowRight aria-hidden className="text-orange min-h-6 min-w-6" />

              <TokenDetails symbol={tokenToReceive.symbol} blockchain={tokenToReceive.blockchain} className="w-fit" />
            </Details.Item>
          </Details.Panel>

          <Details.Panel label={t('fromDetailsPanelLabel')}>
            <Details.Item label={t('fromAddressDetailsItemLabel')}>{accountToUse.address}</Details.Item>

            <Details.Item label={t('fromTokenDetailsItemLabel')}>
              <TokenDetails symbol={tokenToUse.symbol} blockchain={tokenToUse.blockchain} amount={amountToUse} />
            </Details.Item>
          </Details.Panel>

          <Details.Panel label={t('toDetailsPanelLabel')}>
            <Details.Item label={t('toAddressDetailsItemLabel')}>{addressToReceive}</Details.Item>

            <Details.Item label={t('toTokenDetailsItemLabel')}>
              <TokenDetails
                symbol={tokenToReceive.symbol}
                blockchain={tokenToReceive.blockchain}
                amount={amountToReceive}
              />
            </Details.Item>
          </Details.Panel>
        </Details.Body>
      </Details.Root>

      <Details.Root className="mt-2.5">
        <Details.Header leftElement={<TbReceipt aria-hidden />}>{t('feesDetailsPanelLabel')}</Details.Header>
        <Details.Body>
          <Details.Panel>
            <Details.Item label={t('feeDetailsItemLabel')}>
              <TokenDetails symbol={fromService.feeToken.symbol} blockchain={fromService.name} amount={bridgeFee} />
            </Details.Item>
          </Details.Panel>
        </Details.Body>
      </Details.Root>

      <Button
        className="mt-9 px-5"
        leftIcon={<MdCheck aria-hidden />}
        iconsOnEdge={false}
        label={t('confirmButtonLabel')}
        loading={isConfirming}
        onClick={startConfirm}
      />
    </SideModalLayout>
  )
}

export default Neo3NeoxBridgeConfirmationModal
