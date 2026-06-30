import { Card } from '../ui/Card'
import { SkeletonText } from '../ui/Skeleton'

export function HistoryCardSkeleton() {
  return (
    <Card className="flex flex-col gap-3" aria-busy="true" aria-label="Loading">
      <SkeletonText />
      <SkeletonText width="w-3/4" />
      <SkeletonText width="w-1/2" />
    </Card>
  )
}
