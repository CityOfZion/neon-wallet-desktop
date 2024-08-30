import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      gcTime: Infinity,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
})
