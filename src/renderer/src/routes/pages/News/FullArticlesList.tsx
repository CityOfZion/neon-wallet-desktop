import { useState } from 'react'

import { useTranslation } from 'react-i18next'
import { match } from 'ts-pattern'

import { Checkbox } from '@renderer/components/Checkbox'
import { Loader } from '@renderer/components/Loader'
import { Select } from '@renderer/components/Select'
import { Separator } from '@renderer/components/Separator'

import { useInfiniteScroll } from '@renderer/hooks/useInfiniteScroll'
import { useAppDispatch } from '@renderer/hooks/useRedux'
import { useShowNewsModalSelector } from '@renderer/hooks/useSettingsSelector'

import { settingsReducerActions } from '@renderer/store/reducers/settings'
import { TNewsArticle } from '@shared/types/query'

import { ArticleListItem } from './ArticleListItem'

export type TSortOrder = 'desc' | 'asc'

type TProps = {
  articles: TNewsArticle[]
  isArticlesListLoading: boolean
  sortOrder: TSortOrder
  onSortOrderChange: (order: TSortOrder) => void
  onSelectArticle: (index: number) => void
  onFetchNextPage: () => void
}

type TGroupedArticles = {
  year: number
  items: { article: TNewsArticle; index: number }[]
}[]

export const FullArticlesList = ({
  articles,
  isArticlesListLoading,
  sortOrder,
  onSortOrderChange,
  onSelectArticle,
  onFetchNextPage,
}: TProps) => {
  const { t } = useTranslation('pages', { keyPrefix: 'news' })
  const { showNewsModal } = useShowNewsModalSelector()
  const dispatch = useAppDispatch()

  const { handleScroll, ref } = useInfiniteScroll<HTMLElement>(() => {
    onFetchNextPage()
  })

  const [shouldShowModalOnLogin, setShouldShowModalOnLogin] = useState(showNewsModal)

  const groupedArticles = articles
    .map((article, index) => ({ article, index }))
    .reduce<TGroupedArticles>((groups, { article, index }) => {
      const year = new Date(article.created_at).getFullYear()

      const existing = groups.find(group => group.year === year)

      if (existing) {
        existing.items.push({ article, index })
      } else {
        groups.push({ year, items: [{ article, index }] })
      }
      return groups
    }, [])

  const handleShouldShowModalOnLoginChange = (checked: boolean) => {
    setShouldShowModalOnLogin(checked)
    dispatch(settingsReducerActions.setShowNewsModal(checked))
  }

  return (
    <section
      ref={ref}
      onScroll={handleScroll}
      className="flex min-h-0 w-full flex-1 flex-col items-center overflow-y-auto rounded-sm bg-gray-700/35 text-sm"
    >
      <h2 className="w-full rounded-t border-b border-gray-300/30 bg-gray-800 px-4 py-3 text-sm text-white">
        {t('articlesTitle')}
      </h2>

      <div className="mt-5 flex h-full w-full max-w-2xl flex-1 flex-col items-center">
        <div className="flex w-full justify-between">
          <div className="flex items-center justify-center font-normal">
            <Checkbox
              onCheckedChange={handleShouldShowModalOnLoginChange}
              id="showModalOnLoginCheckbox"
              checked={shouldShowModalOnLogin}
            />

            <label htmlFor="showModalOnLoginCheckbox" className="cursor-pointer pl-2 text-sm text-gray-100 select-none">
              {t('showModalOnLoginLabel')}
            </label>
          </div>

          <Select.Root value={sortOrder} onValueChange={value => onSortOrderChange(value as TSortOrder)}>
            <Select.Trigger className="bg-asphalt ml-auto w-fit py-2 text-xs text-gray-100 uppercase">
              <Select.Value />
              <Select.Icon className="text-neon" />
            </Select.Trigger>

            <Select.Content>
              <Select.Item value="desc">
                <Select.ItemText>{t('sortDateDescending')}</Select.ItemText>
              </Select.Item>

              <Select.Separator />

              <Select.Item value="asc">
                <Select.ItemText>{t('sortDateAscending')}</Select.ItemText>
              </Select.Item>
            </Select.Content>
          </Select.Root>
        </div>

        {match({ isArticlesListLoading, hasArticles: groupedArticles.length > 0 })
          .with({ isArticlesListLoading: true }, () => (
            <Loader className="size-10 text-gray-100" containerClassName="pb-12 h-full items-center" />
          ))
          .with({ hasArticles: false }, () => (
            <p className="flex flex-1 items-center justify-center pb-12 text-base text-gray-100">
              {t('noArticlesMessage')}
            </p>
          ))
          .otherwise(() => (
            <div className="flex w-full flex-col gap-y-4 pt-2 pb-8">
              {groupedArticles.map(group => (
                <div key={group.year}>
                  <p className="px-4 py-2 text-sm font-medium text-white">{group.year}</p>
                  <Separator />
                  <ul className="flex flex-col gap-y-3">
                    {group.items.map(({ article, index }) => (
                      <ArticleListItem
                        key={`${article.id}`}
                        article={article}
                        onSelect={() => onSelectArticle(index)}
                      />
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          ))}
      </div>
    </section>
  )
}
