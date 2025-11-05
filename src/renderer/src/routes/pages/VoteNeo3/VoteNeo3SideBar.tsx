import { useTranslation } from 'react-i18next'

import { Banner } from '@renderer/components/Banner'
import { Separator } from '@renderer/components/Separator'

import MdInfoOutline from '@renderer/assets/images/md-info-outline.svg?react'

export const VoteNeo3SideBar = () => {
  const { t } = useTranslation('pages', { keyPrefix: 'voteNeo3.sideBar' })

  return (
    <div className="flex w-72 max-w-72 min-w-72 flex-col border-r border-gray-300/15 px-4 pt-1 pb-6">
      <div className="flex h-12 items-center gap-x-2">
        <MdInfoOutline aria-hidden className="text-green h-6 w-6" />

        <h2 className="text-sm text-white">{t('title')}</h2>
      </div>

      <Separator />

      <p className="mt-8 text-xs text-gray-100">{t('aboutNeoLabel')}</p>

      <strong className="mt-6 mb-0.5 text-xs font-bold text-gray-100">{t('whyVoteTitle')}</strong>

      <p className="text-xs text-gray-100">{t('whyVoteDescription')}</p>

      <p className="mt-6 grow text-xs text-gray-100 italic">{t('noteLabel')}</p>

      <Banner type="alert" message={t('sellNeoAlert')} className="mt-12" textClassName="py-3" />
    </div>
  )
}
