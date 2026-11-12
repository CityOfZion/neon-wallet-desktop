import { useTranslation } from 'react-i18next'

import { Separator } from '@renderer/components/Separator'

import MdInfoOutline from '@renderer/assets/images/md-info-outline.svg?react'

export const SwapExplanation = () => {
  const { t } = useTranslation('pages', { keyPrefix: 'swap.explanation' })

  return (
    <div className="flex w-72 flex-col border-r border-gray-300/15 bg-gray-900/50 px-4">
      <div className="flex items-center gap-2.5">
        <MdInfoOutline aria-hidden className="text-green min-size-6 max-size-6 size-6" />
        <h2 className="my-3 text-sm text-white">{t('title')}</h2>
      </div>

      <Separator />

      <div className="mt-7 mb-6 flex grow flex-col items-center justify-between">
        <div className="flex flex-col gap-4 text-xs text-white">
          <p className="font-bold">{t('description1')}</p>

          <p>{t('description2')}</p>
        </div>
      </div>
    </div>
  )
}
