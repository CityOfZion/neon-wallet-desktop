import { Skeleton } from '@renderer/components/Skeleton'

export const TransactionActivityListSkeleton = () => (
  <div className="flex flex-col overflow-y-auto min-h-0 w-full gap-y-6 py-4">
    {new Array(4).fill(null).map((_, index) => (
      <div key={`skeleton-${index}`} className="flex flex-col gap-y-2">
        <Skeleton className="h-10" />

        <div className="flex gap-x-2 h-8.5">
          <Skeleton className="h-full max-w-20" />
          <Skeleton className="h-full" />
        </div>

        <div className="flex flex-col gap-y-2 ml-20 pl-2">
          <Skeleton className="h-[3.3125rem]" />
          <Skeleton className="h-[3.3125rem]" />
          <Skeleton className="h-[3.3125rem]" />
        </div>
      </div>
    ))}
  </div>
)
