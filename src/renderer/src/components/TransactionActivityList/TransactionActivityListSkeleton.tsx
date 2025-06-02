import { Skeleton } from '@renderer/components/Skeleton'

export const TransactionActivityListSkeleton = () => (
  <div className="flex min-h-0 w-full flex-col gap-y-6 overflow-y-auto py-4">
    {new Array(4).fill(null).map((_, index) => (
      <div key={`skeleton-${index}`} className="flex flex-col gap-y-2">
        <Skeleton className="h-10" />

        <div className="flex h-8.5 gap-x-2">
          <Skeleton className="h-full max-w-20" />
          <Skeleton className="h-full" />
        </div>

        <div className="ml-20 flex flex-col gap-y-2 pl-2">
          <Skeleton className="h-[3.3125rem]" />
          <Skeleton className="h-[3.3125rem]" />
          <Skeleton className="h-[3.3125rem]" />
        </div>
      </div>
    ))}
  </div>
)
