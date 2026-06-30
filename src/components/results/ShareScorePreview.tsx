import { Zap } from 'lucide-react'
import { useLanguage } from '../../hooks/useLanguage'
import type { Quiz, QuizAttempt } from '../../types/quiz'
import { formatCompletionDate } from '../../utils/formatDate'
import { getGradeKey } from '../../utils/scoreGrade'

interface ShareScorePreviewProps {
  attempt: QuizAttempt
  quiz: Quiz
}

export function ShareScorePreview({ attempt, quiz }: ShareScorePreviewProps) {
  const { t, currentLang } = useLanguage()
  const gradeKey = getGradeKey(attempt.percentage)

  return (
    <div
      className="w-[320px] max-w-full overflow-hidden rounded-2xl bg-gradient-to-br from-brand-600 to-brand-700 p-6 text-white shadow-lg"
      aria-hidden="true"
    >
      <div className="flex items-center gap-2">
        <Zap className="h-5 w-5 shrink-0 text-white" aria-hidden />
        <span className="font-display text-lg font-bold">QuizForge</span>
      </div>

      <p className="mt-4 truncate text-sm text-white/90">{quiz.title}</p>

      <p className="mt-3 font-display text-5xl font-bold tabular-nums">
        {attempt.score}
        <span className="text-2xl font-semibold text-white/80">/{attempt.totalPoints}</span>
      </p>

      <p className="mt-2 text-base font-semibold">{t(gradeKey)}</p>

      <p className="mt-4 text-xs text-white/70">
        {formatCompletionDate(attempt.completedAt, currentLang)}
      </p>
    </div>
  )
}
