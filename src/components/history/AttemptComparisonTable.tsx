import clsx from 'clsx'
import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLanguage } from '../../hooks/useLanguage'
import type { QuizAttempt } from '../../types/quiz'
import { formatCompletionDate, formatDuration } from '../../utils/formatDate'
import { getGradeKey } from '../../utils/scoreGrade'
import { Card } from '../ui/Card'

interface AttemptComparisonTableProps {
  attempts: QuizAttempt[]
}

function getAccuracy(attempt: QuizAttempt): number {
  const total = attempt.feedback.length
  if (total === 0) return attempt.percentage
  const correct = attempt.feedback.filter((f) => f.isCorrect).length
  return Math.round((correct / total) * 1000) / 10
}

export function AttemptComparisonTable({
  attempts,
}: AttemptComparisonTableProps) {
  const { t, currentLang } = useLanguage()
  const navigate = useNavigate()

  const chronological = useMemo(
    () =>
      [...attempts].sort(
        (a, b) =>
          new Date(a.completedAt).getTime() - new Date(b.completedAt).getTime(),
      ),
    [attempts],
  )

  const bestAttemptId = useMemo(() => {
    return chronological.reduce((best, current) =>
      current.percentage > best.percentage ? current : best,
    ).id
  }, [chronological])

  return (
    <section>
      <h2 className="mb-4 text-xl font-semibold text-text-primary">
        {t('history.compareAttempts')}
      </h2>
      <Card className="overflow-x-auto p-0">
        <table className="w-full min-w-[36rem] text-left text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-text-muted">
              <th className="px-4 py-3 font-medium">{t('history.attempt')}</th>
              <th className="px-4 py-3 font-medium">{t('history.date')}</th>
              <th className="px-4 py-3 font-medium">{t('history.score')}</th>
              <th className="px-4 py-3 font-medium">{t('results.accuracy')}</th>
              <th className="px-4 py-3 font-medium">{t('history.duration')}</th>
              <th className="px-4 py-3 font-medium">{t('history.grade')}</th>
            </tr>
          </thead>
          <tbody>
            {chronological.map((attempt, index) => {
              const isBest = attempt.id === bestAttemptId
              return (
                <tr
                  key={attempt.id}
                  className={clsx(
                    'cursor-pointer border-b border-gray-50 transition-colors last:border-0 hover:bg-gray-50',
                    isBest && 'bg-green-50 hover:bg-green-50/80',
                  )}
                  onClick={() => navigate(`/results/${attempt.id}`)}
                >
                  <td className="px-4 py-3 font-medium text-text-primary">
                    {t('history.attemptNumber', { n: index + 1 })}
                  </td>
                  <td className="px-4 py-3 text-text-muted">
                    {formatCompletionDate(attempt.completedAt, currentLang)}
                  </td>
                  <td className="px-4 py-3 tabular-nums text-text-primary">
                    {attempt.score}/{attempt.totalPoints}
                  </td>
                  <td className="px-4 py-3 tabular-nums text-text-primary">
                    {getAccuracy(attempt)}%
                  </td>
                  <td className="px-4 py-3 tabular-nums text-text-muted">
                    {formatDuration(attempt.timeTaken)}
                  </td>
                  <td className="px-4 py-3 text-text-primary">
                    {t(getGradeKey(attempt.percentage))}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </Card>
    </section>
  )
}
