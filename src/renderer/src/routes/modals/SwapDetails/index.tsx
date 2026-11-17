import { useTranslation } from 'react-i18next'
import { match, P } from 'ts-pattern'

import { Loader } from '@renderer/components/Loader'

import { useModalState } from '@renderer/hooks/useModalRouter'
import { useSwapOrder } from '@renderer/hooks/useSwapOrder'

import { SideModalLayout } from '@renderer/layouts/SideModal'

import TbReplace from '@renderer/assets/images/tb-replace.svg?react'

import type { TModalState } from '@shared/types/modal'

import { SwapDetailsModalContent } from './SwapDetailsModalContent'

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
