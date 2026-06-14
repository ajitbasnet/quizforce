import { useMemo } from 'react'
import { useLanguage } from '../../hooks/useLanguage'
import type { Quiz, QuizAttempt } from '../../types/quiz'
import { getScoreBreakdown } from '../../utils/scoreBreakdown'
import { Card } from '../ui/Card'

interface ScoreBreakdownProps {
  quiz: Quiz
  attempt: QuizAttempt
}

const DIFFICULTY_LABEL_KEYS = {
  easy: 'quiz.difficultyEasy',
  medium: 'quiz.difficultyMedium',
  hard: 'quiz.difficultyHard',
} as const

export function ScoreBreakdown({ quiz, attempt }: ScoreBreakdownProps) {
  const { t } = useLanguage()
  const data = useMemo(() => getScoreBreakdown(quiz, attempt), [quiz, attempt])

  const total = data.correctCount + data.incorrectCount
  const correctPct = total > 0 ? (data.correctCount / total) * 100 : 0
  const incorrectPct = total > 0 ? (data.incorrectCount / total) * 100 : 0

  const barAriaLabel = [
    t('results.correctBarLabel', {
      count: data.correctCount,
      points: data.correctPoints,
    }),
    t('results.incorrectBarLabel', { count: data.incorrectCount }),
  ].join('. ')

  return (
    <Card className="p-6 sm:p-8">
      <h2 className="text-lg font-semibold text-text-primary">
        {t('results.scoreBreakdown')}
      </h2>

      <div className="mt-4">
        <div
          role="img"
          aria-label={barAriaLabel}
          className="flex h-8 overflow-hidden rounded-full"
        >
          {correctPct > 0 ? (
            <div
              className="bg-green-600"
              style={{ width: `${correctPct}%` }}
            />
          ) : null}
          {incorrectPct > 0 ? (
            <div
              className="bg-red-600"
              style={{ width: `${incorrectPct}%` }}
            />
          ) : null}
        </div>

        <div className="mt-3 flex flex-col gap-1 text-sm sm:flex-row sm:justify-between">
          <p className="text-green-600">
            {t('results.correctBarLabel', {
              count: data.correctCount,
              points: data.correctPoints,
            })}
          </p>
          <p className="text-red-600">
            {t('results.incorrectBarLabel', { count: data.incorrectCount })}
          </p>
        </div>
      </div>

      {data.showDifficultyTable ? (
        <table className="mt-6 w-full text-sm">
          <thead>
            <tr className="text-left text-text-muted">
              <th scope="col" className="pb-2 pr-4 font-medium">
                {t('input.difficulty')}
              </th>
              <th scope="col" className="pb-2 pr-4 font-medium">
                {t('results.breakdownQuestions')}
              </th>
              <th scope="col" className="pb-2 pr-4 font-medium">
                {t('results.breakdownCorrect')}
              </th>
              <th scope="col" className="pb-2 font-medium">
                {t('results.accuracy')}
              </th>
            </tr>
          </thead>
          <tbody className="tabular-nums text-text-primary">
            {data.difficultyRows.map((row) => (
              <tr key={row.difficulty} className="border-t border-gray-100">
                <td className="py-2 pr-4">
                  {t(DIFFICULTY_LABEL_KEYS[row.difficulty])}
                </td>
                <td className="py-2 pr-4">{row.total}</td>
                <td className="py-2 pr-4">{row.correct}</td>
                <td className="py-2">{row.accuracy}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : null}
    </Card>
  )
}
