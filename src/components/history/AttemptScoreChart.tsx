import { useMemo } from 'react'
import { useLanguage } from '../../hooks/useLanguage'
import type { QuizAttempt } from '../../types/quiz'
import { Card } from '../ui/Card'

interface AttemptScoreChartProps {
  attempts: QuizAttempt[]
}

const CHART_WIDTH = 480
const CHART_HEIGHT = 200
const PADDING = { top: 20, right: 20, bottom: 32, left: 40 }

export function AttemptScoreChart({ attempts }: AttemptScoreChartProps) {
  const { t } = useLanguage()

  const chronological = useMemo(
    () =>
      [...attempts].sort(
        (a, b) =>
          new Date(a.completedAt).getTime() - new Date(b.completedAt).getTime(),
      ),
    [attempts],
  )

  const plotWidth = CHART_WIDTH - PADDING.left - PADDING.right
  const plotHeight = CHART_HEIGHT - PADDING.top - PADDING.bottom

  const points = useMemo(() => {
    if (chronological.length === 0) return []

    const maxY = Math.max(
      100,
      ...chronological.map((a) => a.percentage),
    )

    return chronological.map((attempt, index) => {
      const x =
        chronological.length === 1
          ? PADDING.left + plotWidth / 2
          : PADDING.left + (index / (chronological.length - 1)) * plotWidth
      const y =
        PADDING.top + plotHeight - (attempt.percentage / maxY) * plotHeight
      return { attempt, x, y, index }
    })
  }, [chronological, plotHeight, plotWidth])

  const linePath = points
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
    .join(' ')

  return (
    <Card className="p-4">
      <svg
        viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
        className="mx-auto w-full max-w-lg"
        role="img"
        aria-label={t('history.compareAttempts')}
      >
        {[0, 25, 50, 75, 100].map((tick) => {
          const y = PADDING.top + plotHeight - (tick / 100) * plotHeight
          return (
            <g key={tick}>
              <line
                x1={PADDING.left}
                y1={y}
                x2={PADDING.left + plotWidth}
                y2={y}
                className="stroke-gray-100"
                strokeWidth={1}
              />
              <text
                x={PADDING.left - 8}
                y={y + 4}
                textAnchor="end"
                className="fill-gray-400 text-[10px]"
              >
                {tick}%
              </text>
            </g>
          )
        })}

        {linePath ? (
          <path
            d={linePath}
            fill="none"
            className="stroke-indigo-500"
            strokeWidth={2}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        ) : null}

        {points.map(({ attempt, x, y, index }) => (
          <g key={attempt.id}>
            <circle
              cx={x}
              cy={y}
              r={6}
              className="fill-indigo-500 stroke-white"
              strokeWidth={2}
            />
            <title>
              {t('history.attemptNumber', { n: index + 1 })}: {attempt.percentage}%
            </title>
            <text
              x={x}
              y={CHART_HEIGHT - 8}
              textAnchor="middle"
              className="fill-gray-500 text-[10px]"
            >
              {index + 1}
            </text>
          </g>
        ))}
      </svg>
    </Card>
  )
}
