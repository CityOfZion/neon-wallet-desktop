import { Fragment } from 'react'
import { useTranslation } from 'react-i18next'
import { MdOutlineContentCopy } from 'react-icons/md'
import { TbList } from 'react-icons/tb'
import { SimpleSwapServiceHelper } from '@cityofzion/bs-swap'
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
        const response = await swapServiceHelper.getStatus(swapId)

        if (response.log) finalLog = response.log
      }

      return JSON.stringify(JSON.parse(finalLog), null, 4)
    },
  })

  const handleCopyLogToClipboard = () => {
    UtilsHelper.copyToClipboard(log)
  }

  return (
    <SideModalLayout
      heading={t('title')}
      headingIcon={<TbList aria-hidden={true} />}
      contentClassName="flex flex-col pt-6"
    >
      {match({ isLoading, log })
        .with({ isLoading: true }, () => <Loader className="w-8 h-8" />)
        .with({ log: P.when(value => !!value && typeof value === 'string') }, () => (
          <Fragment>
            <div className="flex items-center justify-between gap-2 w-full">
              <p className="text-gray-300 text-sm font-medium">{t('copySwapLog')}</p>

              <IconButton
                aria-label={tCommon('copy')}
                size="sm"
                compacted
                icon={<MdOutlineContentCopy aria-hidden={true} className="text-neon" />}
                onClick={handleCopyLogToClipboard}
              />
            </div>

            <div className="w-full flex-grow p-4 rounded bg-gray-900/75 mt-4 whitespace-pre-wrap overflow-y-auto break-words">
              <p className="text-white text-sm">{log}</p>
            </div>
          </Fragment>
        ))
        .otherwise(() => (
          <p className="w-full text-center text-gray-300 text-lg font-medium">{t('thereIsNoLog')}</p>
        ))}
    </SideModalLayout>
  )
}
