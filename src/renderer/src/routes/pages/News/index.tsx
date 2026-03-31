import { useEffect } from 'react'

import { useTranslation } from 'react-i18next'
import { Location, useLocation } from 'react-router'

import { CommonScreenActions } from '@renderer/components/CommonScreenActions'

import { useActions } from '@renderer/hooks/useActions'
import { useNewsArticles } from '@renderer/hooks/useNewsArticles'

import { MainLayout } from '@renderer/layouts/Main'

import { FullArticlesList, TSortOrder } from './FullArticlesList'
import { ViewArticle } from './ViewArticle'

type TLocationState = {
  selectedIndex?: number
}

type TActionsData = {
  sortOrder: TSortOrder
  selectedIndex: number | null
}

const NewsPage = () => {
  const { t } = useTranslation('pages', { keyPrefix: 'news' })
  const { state } = useLocation() as Location<TLocationState>

  const { articles, isLoading, fetchNextPage, isFetching, hasNextPage } = useNewsArticles()

  const {
    actionData: { sortOrder, selectedIndex },
    setData,
  } = useActions<TActionsData>({
    sortOrder: 'desc',
    selectedIndex: state?.selectedIndex ?? null,
  })

  const sortedArticles = [...articles].sort((a, b) => {
    const dateA = new Date(a.created_at).getTime()
    const dateB = new Date(b.created_at).getTime()
    return sortOrder === 'desc' ? dateB - dateA : dateA - dateB
  })

  const handlePreviousArticle = () => {
    if (selectedIndex !== null && selectedIndex > 0) {
      setData({ selectedIndex: selectedIndex - 1 })
    }
  }

  const handleNextArticle = () => {
    if (selectedIndex !== null && selectedIndex < sortedArticles.length - 1) {
      setData({ selectedIndex: selectedIndex + 1 })
    }
  }

  const isFetchingAllForAsc = sortOrder === 'asc' && (hasNextPage ?? false)

  useEffect(() => {
    if (isFetchingAllForAsc && !isFetching) {
      fetchNextPage()
    }
  }, [isFetchingAllForAsc, isFetching, fetchNextPage])

  return (
    <MainLayout heading={t('title')} rightComponent={<CommonScreenActions />}>
      {selectedIndex !== null ? (
        <ViewArticle
          article={sortedArticles[selectedIndex]}
          onBack={() => setData({ selectedIndex: null })}
          onPrevious={handlePreviousArticle}
          onNext={handleNextArticle}
        />
      ) : (
        <FullArticlesList
          articles={sortedArticles}
          sortOrder={sortOrder}
          onSortOrderChange={sortOrder => setData({ sortOrder })}
          onSelectArticle={index => setData({ selectedIndex: index })}
          isArticlesListLoading={isLoading || isFetchingAllForAsc}
          onFetchNextPage={fetchNextPage}
        />
      )}
    </MainLayout>
  )
}

export default NewsPage
