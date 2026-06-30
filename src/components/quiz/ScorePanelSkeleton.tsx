import { Card } from '../ui/Card'
import { SkeletonCircle, SkeletonText } from '../ui/Skeleton'

const RING_SIZE = 132

export function ScorePanelSkeleton() {
  return (
    <Card
      className="p-6 text-center sm:p-8"
      aria-busy="true"
      aria-label="Loading"
    >
      <div className="flex flex-col items-center">
        <SkeletonCircle size={RING_SIZE} />
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <Card key={index} className="p-3">
            <SkeletonText className="h-3 w-2/3" />
            <SkeletonText className="mt-2 h-6 w-1/2" />
          </Card>
        ))}
      </div>
    </Card>
  )
}
