import { Volume2 } from 'lucide-react'
import { useEffect, useMemo, useState, type RefObject } from 'react'
import { useCountUp } from '../../hooks/useCountUp'
import { useLanguage } from '../../hooks/useLanguage'
import { useVoice } from '../../hooks/useVoice'
import type { Quiz, QuizAttempt } from '../../types/quiz'
import { formatCompletionDate, formatDuration } from '../../utils/formatDate'
import { getGradeKey } from '../../utils/scoreGrade'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'
import { Tooltip } from '../ui/Tooltip'

interface ScorePanelProps {
  attempt: QuizAttempt
  quiz?: Quiz | null
  voiceEnabled?: boolean
  onReadResults?: () => void
  headingRef?: RefObject<HTMLHeadingElement | null>
}

const RING_SIZE = 132
const STROKE_WIDTH = 10
const RADIUS = (RING_SIZE - STROKE_WIDTH) / 2
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

function getRingColor(pct: number): string {
  if (pct >= 70) return 'stroke-success-600'
  if (pct >= 50) return 'stroke-amber-500'
  return 'stroke-danger-600'
}

interface StatCardProps {
  label: string
  value: string
}

function StatCard({ label, value }: StatCardProps) {
  return (
    <Card className="p-3">
      <p className="text-xs text-text-muted">{label}</p>
      <p className="mt-1 text-lg font-semibold text-text-primary tabular-nums">{value}</p>
    </Card>
  )
}

export function ScorePanel({
  attempt,
  quiz,
  voiceEnabled,
  onReadResults,
  headingRef,
}: ScorePanelProps) {
  const { t, currentLang } = useLanguage()
  const { isSupported } = useVoice()
  const animatedScore = useCountUp(attempt.score, 1200)
  const [ringOffset, setRingOffset] = useState(CIRCUMFERENCE)

  const { correctCount, wrongCount, accuracy } = useMemo(() => {
    const correct = attempt.feedback.filter((f) => f.isCorrect).length
    const total = attempt.feedback.length
    return {
      correctCount: correct,
      wrongCount: total - correct,
      accuracy: total > 0 ? Math.round((correct / total) * 1000) / 10 : 0,
    }
  }, [attempt.feedback])

  const percentage = attempt.percentage
  const ringColor = getRingColor(percentage)
  const gradeKey = getGradeKey(percentage)
  const targetOffset = CIRCUMFERENCE - (percentage / 100) * CIRCUMFERENCE

  useEffect(() => {
    const rafId = requestAnimationFrame(() => {
      setRingOffset(targetOffset)
    })
    return () => cancelAnimationFrame(rafId)
  }, [targetOffset])

  return (
    <Card className="p-6 sm:p-8 text-center">
      <h2
        ref={headingRef}
        tabIndex={-1}
        className="text-lg font-semibold text-text-primary"
      >
        {quiz?.title ?? t('results.yourScore')}
      </h2>

      <div
        aria-live="polite"
        aria-atomic="true"
        className="mt-4 flex items-baseline justify-center gap-2"
      >
        <span
          aria-hidden
          className="font-display text-6xl font-bold text-brand-600 tabular-nums"
        >
          {animatedScore}
        </span>
        <span className="text-xl text-text-muted" aria-hidden>
          / {attempt.totalPoints} {t('results.points')}
        </span>
        {animatedScore === attempt.score ? (
          <span className="sr-only">
            {t('results.yourScore')}: {attempt.score} / {attempt.totalPoints}{' '}
            {t('results.points')}
          </span>
        ) : null}
      </div>

      <div className="mt-6 flex flex-col items-center">
        <div className="relative inline-flex items-center justify-center">
          <svg
            role="img"
            aria-label={`${percentage}%`}
            width={RING_SIZE}
            height={RING_SIZE}
            className="-rotate-90"
          >
            <circle
              cx={RING_SIZE / 2}
              cy={RING_SIZE / 2}
              r={RADIUS}
              fill="none"
              className="stroke-gray-200"
              strokeWidth={STROKE_WIDTH}
            />
            <circle
              cx={RING_SIZE / 2}
              cy={RING_SIZE / 2}
              r={RADIUS}
              fill="none"
              className={ringColor}
              strokeWidth={STROKE_WIDTH}
              strokeLinecap="round"
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={ringOffset}
              style={{ transition: 'stroke-dashoffset 1.2s ease-out' }}
            />
          </svg>
          <span className="absolute font-display text-3xl font-bold text-text-primary tabular-nums">
            {percentage}%
          </span>
        </div>

        <p className="mt-3 text-lg font-semibold text-text-primary">{t(gradeKey)}</p>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label={t('results.questionsCorrect')} value={String(correctCount)} />
        <StatCard label={t('results.questionsWrong')} value={String(wrongCount)} />
        <StatCard
          label={t('results.timeTaken')}
          value={formatDuration(attempt.timeTaken)}
        />
        <StatCard label={t('results.accuracy')} value={`${accuracy}%`} />
      </div>

      <p className="mt-4 text-sm text-text-muted">
        {formatCompletionDate(attempt.completedAt, currentLang)}
      </p>

      {voiceEnabled && onReadResults ? (
        isSupported ? (
          <Button
            type="button"
            variant="secondary"
            className="mt-4 print:hidden"
            leftIcon={<Volume2 className="h-4 w-4" aria-hidden />}
            onClick={onReadResults}
          >
            {t('results.readMyResults')}
          </Button>
        ) : (
          <Tooltip content={t('voice.notSupported')}>
            <span className="mt-4 inline-flex">
              <Button
                type="button"
                variant="secondary"
                className="print:hidden"
                leftIcon={<Volume2 className="h-4 w-4" aria-hidden />}
                disabled
              >
                {t('results.readMyResults')}
              </Button>
            </span>
          </Tooltip>
        )
      ) : null}
    </Card>
  )
}
