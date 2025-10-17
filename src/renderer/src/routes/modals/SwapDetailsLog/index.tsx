import { Fragment } from 'react'

import { SimpleSwapService } from '@cityofzion/bs-multichain'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { match, P } from 'ts-pattern'

import { IconButton } from '@renderer/components/IconButton'
import { Loader } from '@renderer/components/Loader'

import { UtilsHelper } from '@renderer/helpers/UtilsHelper'

import { useModalState } from '@renderer/hooks/useModalRouter'

import { SideModalLayout } from '@renderer/layouts/SideModal'

import MdOutlineContentCopy from '@renderer/assets/images/md-outline-content-copy.svg?react'
import TbList from '@renderer/assets/images/tb-list.svg?react'

import { TSwapRecord } from '@shared/@types/store'

type TState = {
  swapRecord: TSwapRecord
}

const swapService = new SimpleSwapService()

const SwapDetailsLogModal = () => {
  const { t } = useTranslation('modals', { keyPrefix: 'swapDetailsLog' })
  const { t: tCommon } = useTranslation('common', { keyPrefix: 'general' })
  const modalState = useModalState<TState>()

  const {
    swapRecord: { swapId, ...swapRecord },
  } = modalState

  const { isLoading, data: log } = useQuery({
    queryKey: ['swap-details-log', swapId, swapRecord.txFrom, swapRecord.txTo],
    queryFn: async () => {
      let finalLog = swapRecord.log

      if (!finalLog) {
        const response = await swapService.getStatus(swapId!)
        if (response.log) finalLog = response.log
      }

      return JSON.stringify(JSON.parse(finalLog ?? ''), null, 4)
    },
  })

  const handleCopyLogToClipboard = () => {
    if (!log) return
    UtilsHelper.copyToClipboard(log)
  }

  return (
    <SideModalLayout heading={t('title')} headingIcon={<TbList aria-hidden />} contentClassName="flex flex-col pt-6">
      {match({ isLoading, log })
        .with({ isLoading: true }, () => <Loader className="h-8 w-8" />)
        .with({ log: P.when(value => !!value && typeof value === 'string') }, () => (
          <Fragment>
            <div className="flex w-full items-center justify-between gap-2">
              <p className="text-sm font-medium text-gray-300">{t('copySwapLog')}</p>

              <IconButton
                aria-label={tCommon('copy')}
                size="sm"
                compacted
                icon={<MdOutlineContentCopy aria-hidden className="text-neon" />}
                onClick={handleCopyLogToClipboard}
              />
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
