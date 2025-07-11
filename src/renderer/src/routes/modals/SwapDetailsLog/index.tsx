import { Fragment } from 'react'
import { useTranslation } from 'react-i18next'
import { SimpleSwapServiceHelper } from '@cityofzion/bs-swap'
import MdOutlineContentCopy from '@renderer/assets/images/md-outline-content-copy.svg?react'
import TbList from '@renderer/assets/images/tb-list.svg?react'
import { IconButton } from '@renderer/components/IconButton'
import { Loader } from '@renderer/components/Loader'
import { UtilsHelper } from '@renderer/helpers/UtilsHelper'
import { useModalState } from '@renderer/hooks/useModalRouter'
import { SideModalLayout } from '@renderer/layouts/SideModal'
import { TSwapRecord } from '@shared/@types/store'
import { useQuery } from '@tanstack/react-query'
import { match, P } from 'ts-pattern'

type TState = {
  swapRecord: TSwapRecord
}

const swapServiceHelper = new SimpleSwapServiceHelper()

export const SwapDetailsLogModal = () => {
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
        const response = await swapServiceHelper.getStatus(swapId!)
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
    <SideModalLayout
      heading={t('title')}
      headingIcon={<TbList aria-hidden={true} />}
      contentClassName="flex flex-col pt-6"
    >
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
                icon={<MdOutlineContentCopy aria-hidden={true} className="text-neon" />}
                onClick={handleCopyLogToClipboard}
              />
            </div>

            <div className="mt-4 w-full flex-grow overflow-y-auto whitespace-pre-wrap break-words rounded bg-gray-900/75 p-4">
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
