import { useTranslation } from 'react-i18next'
import TbList from '@renderer/assets/images/tb-list.svg?react'

export const VoteNeo3NotFound = () => {
  const { t } = useTranslation('pages', { keyPrefix: 'voteNeo3.notFound' })

  return (
    <div className="mx-auto mt-4 flex w-full max-w-96 flex-col items-center justify-center gap-y-1 text-center">
      <TbList aria-hidden={true} className="mb-2 h-12 w-12 text-neon" />
      <h3 className="text-lg font-semibold">{t('title')}</h3>
      <p className="text-xs text-gray-100">{t('text')}</p>
    </div>
  )
}
