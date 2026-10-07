import { useTranslation } from 'react-i18next'

import TbSparkles from '@renderer/assets/images/tb-sparkles.svg?react'

export const AssistantEmptyState = () => {
  const { t } = useTranslation('pages', { keyPrefix: 'assistant.emptyState' })

  return (
    <div className="flex h-full flex-col items-center justify-center text-center">
      <TbSparkles aria-hidden className="text-blue size-24" />

      <p className="mt-2 text-2xl font-medium text-white">{t('title')}</p>
      <p className="mt-1 max-w-68 text-base leading-5 font-thin text-gray-300">{t('description')}</p>
    </div>
  )
}
