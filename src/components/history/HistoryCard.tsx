import clsx from 'clsx'
import { Bookmark, Trash2 } from 'lucide-react'
import { memo, useCallback, type MouseEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { LANGUAGE_OPTIONS } from '../../i18n'
import { useLanguage } from '../../hooks/useLanguage'
import { useHistoryStore } from '../../store/historyStore'
import { useQuizStore } from '../../store/quizStore'
import type { Quiz, QuizAttempt } from '../../types/quiz'
import { formatRelativeTime } from '../../utils/formatRelativeTime'
import { getGradeKey } from '../../utils/scoreGrade'
import { getTagColorClass } from '../../utils/tagColors'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'
import { Tooltip } from '../ui/Tooltip'
import { historyPillRowClass } from './historyToolbarStyles'

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
  if (pct >= 70) return 'stroke-success-600'
  if (pct >= 50) return 'stroke-amber-500'
  return 'stroke-danger-600'
}

const SOURCE_BADGE_CONFIG: Record<
  Quiz['sourceType'],
  { labelKey: string; variant?: 'info' | 'warning'; className?: string }
> = {
  text: { labelKey: 'history.sourceText', variant: 'info' },
  pdf: { labelKey: 'history.sourcePdf', variant: 'warning' },
  prompt: {
    labelKey: 'history.sourcePrompt',
    className: 'bg-purple-100 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300',
  },
  url: {
    labelKey: 'history.sourceUrl',
    className: 'bg-teal-100 text-teal-700 dark:bg-teal-950/50 dark:text-teal-300',
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
        className="stroke-gray-200 dark:stroke-gray-700"
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

function HistoryCardInner({ quiz, latestAttempt, onDelete }: HistoryCardProps) {
  const { t, currentLang } = useLanguage()
  const navigate = useNavigate()
  const setCurrentQuiz = useQuizStore((s) => s.setCurrentQuiz)
  const resetAttempt = useQuizStore((s) => s.resetAttempt)
  const toggleFavorite = useHistoryStore((s) => s.toggleFavorite)

  const isFavorited = quiz.isFavorited ?? false
  const tags = quiz.tags ?? []
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

  const handleToggleFavorite = useCallback(
    (event: MouseEvent) => {
      event.stopPropagation()
      toggleFavorite(quiz.id)
    },
    [quiz.id, toggleFavorite],
  )

  const handleTagClick = useCallback(
    (event: MouseEvent, tag: string) => {
      event.stopPropagation()
      navigate(`/history?tag=${encodeURIComponent(tag)}`)
    },
    [navigate],
  )

  return (
    <Card className="group flex flex-col gap-3" onClick={handleCardClick}>
      <div className="flex min-w-0 items-center justify-between gap-2">
        <div className={clsx(historyPillRowClass, 'min-w-0 flex-1 overflow-x-auto')}>
          <Badge
            variant={sourceBadge.variant}
            size="sm"
            className={clsx('shrink-0', sourceBadge.className)}
          >
            {t(sourceBadge.labelKey)}
          </Badge>
          {tags.length > 0
            ? tags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  className={clsx(
                    'inline-flex max-w-[8rem] shrink-0 truncate rounded-full px-2 py-0.5 text-xs font-medium',
                    getTagColorClass(tag),
                  )}
                  onClick={(event) => handleTagClick(event, tag)}
                >
                  #{tag}
                </button>
              ))
            : null}
        </div>
        <div className="flex shrink-0 items-center gap-1 whitespace-nowrap">
          <Tooltip
            content={
              isFavorited ? t('history.unfavorite') : t('history.favorite')
            }
          >
            <button
              type="button"
              className={clsx(
                'rounded-full p-1 motion-safe:transition-colors motion-safe:duration-micro',
                'hover:bg-surface-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 dark:hover:bg-gray-800',
                isFavorited
                  ? 'text-amber-500'
                  : 'text-gray-300 hover:text-amber-400 dark:text-gray-600',
              )}
              aria-label={
                isFavorited ? t('history.unfavorite') : t('history.favorite')
              }
              aria-pressed={isFavorited}
              onClick={handleToggleFavorite}
            >
              <Bookmark
                className={clsx('h-4 w-4', isFavorited && 'fill-current')}
                aria-hidden
              />
            </button>
          </Tooltip>
          <span className="text-xs text-text-muted dark:text-gray-400">{relativeDate}</span>
        </div>
      </div>

      <div>
        <h3 className="font-semibold text-text-primary line-clamp-2 dark:text-gray-100">
          {quiz.title}
        </h3>
        {quiz.description ? (
          <p className="mt-1 text-sm text-text-muted line-clamp-1 dark:text-gray-400">
            {quiz.description}
          </p>
        ) : null}
      </div>

      <p className="truncate text-sm text-text-muted dark:text-gray-400">
        {t('history.questionsCount', { count: quiz.questions.length })}
        {' • '}
        {t('history.pointsCount', { pts: quiz.totalPoints })}
        {flag ? ` • ${flag}` : ''}
      </p>

      <div className="flex min-w-0 items-center gap-3">
        {latestAttempt ? (
          <>
            <MiniScoreRing percentage={latestAttempt.percentage} />
            <div className="flex min-w-0 flex-nowrap items-center gap-2">
              <span className="shrink-0 text-sm font-medium text-text-primary tabular-nums dark:text-gray-100">
                {latestAttempt.score}/{latestAttempt.totalPoints}
              </span>
              <Badge variant="default" size="sm" className="shrink-0">
                {t(getGradeKey(latestAttempt.percentage))}
              </Badge>
            </div>
          </>
        ) : (
          <span className="text-sm text-text-muted dark:text-gray-400">
            {t('history.notAttempted')}
          </span>
        )}
      </div>

      <div
        className={clsx(
          historyPillRowClass,
          'border-t border-gray-100 pt-3 dark:border-gray-800',
          'opacity-100 motion-safe:transition-opacity motion-safe:duration-micro',
          '[@media(hover:hover)_and_(pointer:fine)]:opacity-0',
          '[@media(hover:hover)_and_(pointer:fine)]:group-hover:opacity-100',
          '[@media(hover:hover)_and_(pointer:fine)]:group-focus-within:opacity-100',
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
            className="text-danger-600 hover:bg-danger-50 dark:hover:bg-danger-950/40"
            aria-label={t('history.deleteQuiz')}
            onClick={handleDelete}
          >
            <Trash2 className="h-4 w-4 shrink-0" aria-hidden />
          </Button>
        </Tooltip>
      </div>
    </Card>
  )
}

export const HistoryCard = memo(HistoryCardInner)
