import { useCallback, useSyncExternalStore } from 'react'
import { notifyManager, QueryFilters, useIsFetching, useQueryClient } from '@tanstack/react-query'

export function useRefetch(filters?: QueryFilters) {
  const queryClient = useQueryClient()

  const isRefetching = useIsFetching({ ...filters, predicate: query => query.state.status !== 'pending' })

  const refetch = useCallback(async () => {
    await queryClient.invalidateQueries({ ...filters, refetchType: 'all' })
  }, [queryClient, filters])

  return {
    refetch,
    isRefetching,
  }
}

export function useLastUpdated(filters?: QueryFilters) {
  const queryClient = useQueryClient()

  const queryCache = queryClient.getQueryCache()

  return useSyncExternalStore(
    useCallback(onStoreChange => queryCache.subscribe(notifyManager.batchCalls(onStoreChange)), [queryCache]),
    () => {
      const queries = queryCache.findAll(filters)
      const sortedQueries = queries.sort((a, b) => b.state.dataUpdatedAt - a.state.dataUpdatedAt)
      return sortedQueries[0].state.dataUpdatedAt
    }
  )
}
