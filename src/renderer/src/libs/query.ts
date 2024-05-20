import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      gcTime: 5 * 60 * 1000, // 5 minutes
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
})
