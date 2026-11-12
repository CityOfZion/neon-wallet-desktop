import { Fragment } from 'react'

import { useTranslation } from 'react-i18next'
import { match, P } from 'ts-pattern'

import { IconButton } from '@renderer/components/IconButton'
import { Loader } from '@renderer/components/Loader'
import { Tooltip } from '@renderer/components/Tooltip'

import { ClipboardHelper } from '@renderer/helpers/ClipboardHelper'

import { useModalState } from '@renderer/hooks/useModalRouter'
import { useSwapOrder } from '@renderer/hooks/useSwapOrder'

import { SideModalLayout } from '@renderer/layouts/SideModal'

import MdOutlineContentCopy from '@renderer/assets/images/md-outline-content-copy.svg?react'
import TbList from '@renderer/assets/images/tb-list.svg?react'

import type { TModalState } from '@shared/types/modal'

const SwapDetailsLogModal = () => {
  const { t } = useTranslation('modals', { keyPrefix: 'swapDetailsLog' })
  const { t: tCommon } = useTranslation('common', { keyPrefix: 'general' })
  const { orderId } = useModalState<TModalState<'swap-details-log'>>()

  const swapOrderQuery = useSwapOrder(orderId)

  return (
    <SideModalLayout
      heading={t('title')}
      headingIcon={<TbList aria-hidden />}
      contentClassName="flex flex-col pt-6"
      size="lg"
    >
      {match(swapOrderQuery)
        .with({ isLoading: true }, () => <Loader className="h-8 w-8" />)
        .with({ data: P.select({ log: P.string }) }, ({ log }) => (
          <Fragment>
            <div className="flex w-full items-center justify-between gap-2">
              <p className="text-sm font-medium text-gray-300">{t('copySwapLog')}</p>

              <Tooltip title={tCommon('copy')}>
                <IconButton
                  aria-label={tCommon('copy')}
                  size="sm"
                  compacted
                  icon={<MdOutlineContentCopy aria-hidden className="text-neon" />}
                  onClick={ClipboardHelper.write.bind(null, log)}
                />
              </Tooltip>
            </div>

            <div className="mt-4 w-full grow overflow-y-auto rounded-sm bg-gray-900/75 p-4 wrap-break-word whitespace-pre-wrap">
              <p className="text-sm text-white">{log}</p>
            </div>
          </Fragment>
        ))
        .otherwise(() => (
          <p className="w-full text-center text-lg font-medium text-gray-300">{t('thereIsNoLog')}</p>
        ))}
    </SideModalLayout>
  )
}

export default SwapDetailsLogModal
