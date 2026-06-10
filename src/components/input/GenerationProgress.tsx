import { useLanguage } from '../../hooks/useLanguage'
import { useQuizStore } from '../../store/quizStore'
import { ProgressBar } from '../ui/ProgressBar'
import { Spinner } from '../ui/Spinner'

export function GenerationProgress() {
  const { t } = useLanguage()
  const generationProgress = useQuizStore((s) => s.generationProgress)

  return (
    <div
      role="status"
      aria-busy="true"
      aria-live="polite"
      className="flex flex-col items-center gap-4 py-8"
    >
      <Spinner size="lg" className="text-primary" />
      <div className="text-center">
        <p className="text-base font-semibold text-text-primary">
          {t('quiz.generatingTitle')}
        </p>
        <p className="mt-1 text-sm text-text-muted">
          {t('quiz.generatingSubtitle')}
        </p>
      </div>
      <ProgressBar value={generationProgress} className="w-full max-w-sm" />
    </div>
  )
}
