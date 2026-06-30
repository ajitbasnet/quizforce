import clsx from 'clsx'
import { Trash2 } from 'lucide-react'
import { useCallback, type MouseEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { LANGUAGE_OPTIONS } from '../../i18n'
import { useLanguage } from '../../hooks/useLanguage'
import { useQuizStore } from '../../store/quizStore'
import type { Quiz, QuizAttempt } from '../../types/quiz'
import { formatRelativeTime } from '../../utils/formatRelativeTime'
import { getGradeKey } from '../../utils/scoreGrade'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'
import { Tooltip } from '../ui/Tooltip'

interface HistoryCardProps {
  quiz: Quiz
  latestAttempt: QuizAttempt | null
  onDelete: (quizId: string) => void
}

const MINI_RING_SIZE = 40
const MINI_STROKE_WIDTH = 4
const MINI_RADIUS = (MINI_RING_SIZE - MINI_STROKE_WIDTH) / 2
const MINI_CIRCUMFERENCE = 2 * Math.PI * MINI_RADIUS

function getRingColor(pct: number): string {
  if (pct >= 70) return 'stroke-green-600'
  if (pct >= 50) return 'stroke-amber-500'
  return 'stroke-red-600'
}

const SOURCE_BADGE_CONFIG: Record<
  Quiz['sourceType'],
  { labelKey: string; variant?: 'info' | 'warning'; className?: string }
> = {
  text: { labelKey: 'history.sourceText', variant: 'info' },
  pdf: { labelKey: 'history.sourcePdf', variant: 'warning' },
  prompt: {
    labelKey: 'history.sourcePrompt',
    className: 'bg-purple-100 text-purple-700',
  },
  url: {
    labelKey: 'history.sourceUrl',
    className: 'bg-teal-100 text-teal-700',
  },
}

function MiniScoreRing({ percentage }: { percentage: number }) {
  const ringColor = getRingColor(percentage)
  const strokeDashoffset =
    MINI_CIRCUMFERENCE - (percentage / 100) * MINI_CIRCUMFERENCE

  return (
    <svg
      role="img"
      aria-label={`${percentage}%`}
      width={MINI_RING_SIZE}
      height={MINI_RING_SIZE}
      className="-rotate-90 shrink-0"
    >
      <circle
        cx={MINI_RING_SIZE / 2}
        cy={MINI_RING_SIZE / 2}
        r={MINI_RADIUS}
        fill="none"
        className="stroke-gray-200"
        strokeWidth={MINI_STROKE_WIDTH}
      />
      <circle
        cx={MINI_RING_SIZE / 2}
        cy={MINI_RING_SIZE / 2}
        r={MINI_RADIUS}
        fill="none"
        className={ringColor}
        strokeWidth={MINI_STROKE_WIDTH}
        strokeLinecap="round"
        strokeDasharray={MINI_CIRCUMFERENCE}
        strokeDashoffset={strokeDashoffset}
      />
    </svg>
  )
}

export function HistoryCard({ quiz, latestAttempt, onDelete }: HistoryCardProps) {
  const { t, currentLang } = useLanguage()
  const navigate = useNavigate()
  const setCurrentQuiz = useQuizStore((s) => s.setCurrentQuiz)
  const resetAttempt = useQuizStore((s) => s.resetAttempt)

  const sourceBadge = SOURCE_BADGE_CONFIG[quiz.sourceType]
  const flag =
    LANGUAGE_OPTIONS.find((opt) => opt.code === quiz.language)?.flag ?? ''
  const relativeDate = formatRelativeTime(
    latestAttempt?.completedAt ?? quiz.createdAt,
    currentLang,
  )

  const handleCardClick = useCallback(() => {
    navigate(`/history/${quiz.id}`)
  }, [navigate, quiz.id])

  const handleRetake = useCallback(
    (event: MouseEvent) => {
      event.stopPropagation()
      setCurrentQuiz(quiz)
      resetAttempt()
      navigate('/quiz')
    },
    [navigate, quiz, resetAttempt, setCurrentQuiz],
  )

  const handleViewResults = useCallback(
    (event: MouseEvent) => {
      event.stopPropagation()
      if (!latestAttempt) return
      navigate(`/results/${latestAttempt.id}`)
    },
    [latestAttempt, navigate],
  )

  const handleDelete = useCallback(
    (event: MouseEvent) => {
      event.stopPropagation()
      onDelete(quiz.id)
    },
    [onDelete, quiz.id],
  )

  return (
    <Card
      className="group flex flex-col gap-3 hover:shadow-md"
      onClick={handleCardClick}
    >
      <div className="flex items-center justify-between gap-2">
        <Badge
          variant={sourceBadge.variant}
          size="sm"
          className={sourceBadge.className}
        >
          {t(sourceBadge.labelKey)}
        </Badge>
        <span className="text-xs text-text-muted">{relativeDate}</span>
      </div>

      <div>
        <h3 className="font-semibold text-text-primary line-clamp-2">
          {quiz.title}
        </h3>
        {quiz.description ? (
          <p className="mt-1 text-sm text-text-muted line-clamp-1">
            {quiz.description}
          </p>
        ) : null}
      </div>

      <p className="text-sm text-text-muted">
        {t('history.questionsCount', { count: quiz.questions.length })}
        {' • '}
        {t('history.pointsCount', { pts: quiz.totalPoints })}
        {flag ? ` • ${flag}` : ''}
      </p>

      <div className="flex items-center gap-3">
        {latestAttempt ? (
          <>
            <MiniScoreRing percentage={latestAttempt.percentage} />
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-medium text-text-primary tabular-nums">
                {latestAttempt.score}/{latestAttempt.totalPoints}
              </span>
              <Badge variant="default" size="sm">
                {t(getGradeKey(latestAttempt.percentage))}
              </Badge>
            </div>
          </>
        ) : (
          <span className="text-sm text-text-muted">{t('history.notAttempted')}</span>
        )}
      </div>

      <div
        className={clsx(
          'flex flex-wrap items-center gap-2 pt-1',
          'opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100',
        )}
      >
        <Button type="button" size="sm" onClick={handleRetake}>
          {t('history.retake')}
        </Button>
        {latestAttempt ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleViewResults}
          >
            {t('history.viewResults')}
          </Button>
        ) : null}
        <Tooltip content={t('history.deleteQuiz')}>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-red-600 hover:bg-red-50"
            aria-label={t('history.deleteQuiz')}
            onClick={handleDelete}
          >
            <Trash2 className="h-4 w-4" aria-hidden />
          </Button>
        </Tooltip>
      </div>
    </Card>
  )
}
