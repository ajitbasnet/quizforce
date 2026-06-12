import { useLanguage } from '../../hooks/useLanguage'
import type { Quiz, QuizAttempt } from '../../types/quiz'
import { Card } from '../ui/Card'

interface ScorePanelProps {
  attempt: QuizAttempt
  quiz?: Quiz | null
}

export function ScorePanel({ attempt, quiz }: ScorePanelProps) {
  const { t } = useLanguage()

  return (
    <Card className="text-center">
      {quiz?.title ? (
        <p className="text-sm font-medium text-text-muted">{quiz.title}</p>
      ) : null}
      <p className="mt-1 text-sm font-medium text-text-muted">
        {t('results.yourScore')}
      </p>
      <p className="mt-2 font-display text-5xl font-bold text-indigo-600 tabular-nums">
        {attempt.score}/{attempt.totalPoints}
      </p>
      <p className="mt-2 text-lg font-semibold text-text-primary">
        {t('results.percentage')}: {attempt.percentage}%
      </p>
    </Card>
  )
}
