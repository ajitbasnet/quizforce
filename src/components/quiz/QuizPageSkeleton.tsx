import { Skeleton, SkeletonText } from '../ui/Skeleton'

export function QuizPageSkeleton() {
  return (
    <div
      className="flex flex-col gap-4"
      aria-busy="true"
      aria-label="Loading"
    >
      <SkeletonText className="h-6" />
      <SkeletonText className="h-6 w-4/5" />
      <div className="mt-2 flex flex-col gap-3">
        {Array.from({ length: 4 }, (_, index) => (
          <Skeleton key={index} className="h-12 rounded-lg" />
        ))}
      </div>
    </div>
  )
}
