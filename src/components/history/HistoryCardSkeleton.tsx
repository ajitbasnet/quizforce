import { Card } from '../ui/Card'
import { SkeletonText } from '../ui/Skeleton'

export function HistoryCardSkeleton() {
  return (
    <Card
      className="flex min-h-[11.5rem] flex-col gap-3"
      aria-busy="true"
      aria-label="Loading"
    >
      <SkeletonText className="h-5" />
      <SkeletonText className="h-4 w-3/4" />
      <div className="mt-auto flex gap-2">
        <SkeletonText className="h-8 w-20" />
        <SkeletonText className="h-8 w-24" />
      </div>
    </Card>
  )
}
