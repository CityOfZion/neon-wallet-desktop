import { useState } from 'react'

import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'
import { match } from 'ts-pattern'

import { Checkbox } from '@renderer/components/Checkbox'
import { Loader } from '@renderer/components/Loader'

import { useModalNavigate } from '@renderer/hooks/useModalRouter'
import { useNewsArticles } from '@renderer/hooks/useNewsArticles'
import { useAppDispatch } from '@renderer/hooks/useRedux'

import { CenterModalLayout } from '@renderer/layouts/CenterModal'

import { ArticleListItem } from '@renderer/routes/pages/News/ArticleListItem'

import NeonWalletFull from '@renderer/assets/images/neon-wallet-full.svg?react'

import { settingsReducerActions } from '@renderer/store/reducers/settings'

const NewsModal = () => {
  const { t } = useTranslation('modals', { keyPrefix: 'news' })
  const navigate = useNavigate()
  const { modalErase } = useModalNavigate()
  const dispatch = useAppDispatch()
  const { articles, isLoading } = useNewsArticles()

  const [dontShowAgain, setDontShowAgain] = useState(false)

  const latestFiveArticles = articles
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5)

  const handleClose = () => {
    if (dontShowAgain) {
      dispatch(settingsReducerActions.setShowNewsModal(false))
    }
  }

  const handleSelectArticle = (index: number) => {
    modalErase()
    navigate('/news', { state: { selectedIndex: index } })
  }

  const handleDontShowAgainChange = (checked: boolean) => {
    setDontShowAgain(checked)
  }

  return (
    <CenterModalLayout contentClassName="flex flex-col w-full items-center" size="lg" onErase={handleClose}>
      <NeonWalletFull aria-hidden className="absolute -mt-12" />
      <h1 className="mt-4 text-2xl text-white">{t('title')}</h1>

      <div className="w-full max-w-2xl flex-1">
        <div className="flex h-full w-full flex-col gap-y-4 pt-2 pb-4">
          <ul className="flex flex-1 flex-col justify-center gap-y-1">
            {match({ isLoading, hasArticles: latestFiveArticles.length > 0 })
              .with({ isLoading: true }, () => <Loader className="size-10 text-gray-100" containerClassName="p-2" />)

              .with({ hasArticles: false }, () => (
                <p className="flex flex-1 items-center justify-center pb-8 text-gray-100">{t('noArticlesMessage')}</p>
              ))

              .otherwise(() =>
                latestFiveArticles.map((article, index) => (
                  <ArticleListItem
                    key={`${article.created_at}-${article.title}`}
                    article={article}
                    onSelect={() => handleSelectArticle(index)}
                  />
                ))
              )}
          </ul>
        </div>

        <div className="mt-auto flex items-center justify-center font-normal">
          <Checkbox onCheckedChange={handleDontShowAgainChange} id="dontShowAgainCheckbox" checked={dontShowAgain} />

          <label htmlFor="dontShowAgainCheckbox" className="cursor-pointer pl-2 text-sm text-gray-100 select-none">
            {t('dontShowAgainLabel')}
          </label>
        </div>
      </div>
    </CenterModalLayout>
  )
}

export default NewsModal
