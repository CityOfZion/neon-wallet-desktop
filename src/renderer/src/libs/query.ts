import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnMount: true,
      refetchOnWindowFocus: false,
      gcTime: Infinity,
      staleTime: 60 * 1000, // 1 minute
    },
  },
})
