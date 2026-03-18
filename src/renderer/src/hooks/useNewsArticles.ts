import { useMemo } from 'react'

import { useInfiniteQuery } from '@tanstack/react-query'
import axios from 'axios'

import { ConstantsHelper } from '@renderer/helpers/ConstantsHelper'

import { TNewsArticle } from '@shared/types/query'

const PAGE_SIZE = 10

const fetchNewsArticles = async (page: number): Promise<TNewsArticle[]> => {
  const response = await axios.get<TNewsArticle[]>(ConstantsHelper.newsApiUrl, {
    params: { page, limit: PAGE_SIZE },
  })
  return response.data
}

export const useNewsArticles = () => {
  const query = useInfiniteQuery({
    queryKey: ['news-articles'],
    queryFn: ({ pageParam: page }) => fetchNewsArticles(page),
    initialPageParam: 1,
    getNextPageParam: (lastPageArticles, _allPages, lastPageParam) =>
      lastPageArticles.length === PAGE_SIZE ? lastPageParam + 1 : undefined,
  })

  const articles = useMemo(() => query.data?.pages.flat() ?? [], [query.data])

  return { articles, ...query }
}
