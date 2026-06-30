import { useNavigate } from 'react-router-dom'
import { useLanguage } from '../../hooks/useLanguage'
import type { QuizAttempt } from '../../types/quiz'
import { formatCompletionDate, formatDuration } from '../../utils/formatDate'
import { getGradeKey } from '../../utils/scoreGrade'
import { Badge } from '../ui/Badge'
import { Card } from '../ui/Card'

interface AttemptHistoryListProps {
  attempts: QuizAttempt[]
}

export function AttemptHistoryList({ attempts }: AttemptHistoryListProps) {
  const { t, currentLang } = useLanguage()
  const navigate = useNavigate()

  if (attempts.length === 0) {
    return null
  }

  return (
    <section>
      <h2 className="mb-4 text-xl font-semibold text-text-primary">
        {t('history.attemptHistory')}
      </h2>
      <Card className="divide-y divide-gray-100 p-0">
        {attempts.map((attempt, index) => {
          const attemptNumber = attempts.length - index
          return (
            <button
              key={attempt.id}
              type="button"
              className="flex w-full flex-wrap items-center justify-between gap-3 px-4 py-3 text-left transition-colors hover:bg-gray-50"
              onClick={() => navigate(`/results/${attempt.id}`)}
            >
              <div className="min-w-0">
                <p className="font-medium text-text-primary">
                  {t('history.attemptNumber', { n: attemptNumber })}
                </p>
                <p className="text-sm text-text-muted">
                  {formatCompletionDate(attempt.completedAt, currentLang)}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-medium tabular-nums text-text-primary">
                  {attempt.score}/{attempt.totalPoints}
                </span>
                <span className="text-sm text-text-muted tabular-nums">
                  {formatDuration(attempt.timeTaken)}
                </span>
                <Badge variant="default" size="sm">
                  {t(getGradeKey(attempt.percentage))}
                </Badge>
              </div>
            </button>
          )
        })}
      </Card>
    </section>
  )
}
