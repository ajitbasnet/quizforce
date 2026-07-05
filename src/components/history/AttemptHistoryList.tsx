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
      <h2 className="mb-4 text-xl font-semibold text-text-primary dark:text-gray-100">
        {t('history.attemptHistory')}
      </h2>
      <Card className="divide-y divide-gray-100 p-0 dark:divide-gray-800">
        {attempts.map((attempt, index) => {
          const attemptNumber = attempts.length - index
          return (
            <button
              key={attempt.id}
              type="button"
              className="flex w-full min-w-0 flex-nowrap items-center justify-between gap-3 px-4 py-3 text-left transition-colors hover:bg-gray-50 dark:hover:bg-gray-800"
              onClick={() => navigate(`/results/${attempt.id}`)}
            >
              <div className="min-w-0 shrink">
                <p className="truncate font-medium text-text-primary dark:text-gray-100">
                  {t('history.attemptNumber', { n: attemptNumber })}
                </p>
                <p className="truncate text-sm text-text-muted dark:text-gray-400">
                  {formatCompletionDate(attempt.completedAt, currentLang)}
                </p>
              </div>
              <div className="flex shrink-0 flex-nowrap items-center gap-2 whitespace-nowrap">
                <span className="text-sm font-medium tabular-nums text-text-primary dark:text-gray-100">
                  {attempt.score}/{attempt.totalPoints}
                </span>
                <span className="text-sm text-text-muted tabular-nums dark:text-gray-400">
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
