import { Skeleton } from '@renderer/components/Skeleton'

export const VoteNeo3ConfirmationSkeleton = () => (
  <div className="flex flex-col gap-y-2">
    <Skeleton className="h-56 max-h-56 min-h-56" />
    <Skeleton className="h-14 max-h-14 min-h-14" />
  </div>
)
