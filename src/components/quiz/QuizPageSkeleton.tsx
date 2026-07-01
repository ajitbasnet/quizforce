import { useLanguage } from '../../hooks/useLanguage'
import { Skeleton, SkeletonText } from '../ui/Skeleton'

export function QuizPageSkeleton() {
  const { t } = useLanguage()

  return (
    <div
      className="flex flex-col gap-4"
      aria-busy="true"
      aria-label={t('quiz.preparingQuestions')}
    >
      <p className="sr-only" aria-live="polite">
        {t('quiz.preparingQuestions')}
      </p>
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
