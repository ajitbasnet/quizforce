import { animate, motion } from 'framer-motion'
import { useEffect, useMemo, useState } from 'react'
import { Navigate, useParams } from 'react-router-dom'
import { PageWrapper } from '../components/layout/PageWrapper'
import { useLanguage } from '../hooks/useLanguage'
import { useHistoryStore } from '../store/historyStore'
import { useQuizStore } from '../store/quizStore'
import type { QuizAttempt } from '../types/quiz'

function formatTimeTaken(seconds: number): string {
  const minutes = Math.floor(seconds / 60)
  const secs = seconds % 60
  if (minutes > 0) {
    return `${minutes}m ${secs}s`
  }
  return `${secs}s`
}

export default function ResultsPage() {
  const { t } = useLanguage()
  const { attemptId } = useParams()
  const completedAttempt = useQuizStore((s) => s.completedAttempt)
  const getAttemptById = useHistoryStore((s) => s.getAttemptById)

  const attempt = useMemo((): QuizAttempt | undefined => {
    if (!attemptId) return undefined
    if (completedAttempt?.id === attemptId) return completedAttempt
    return getAttemptById(attemptId)
  }, [attemptId, completedAttempt, getAttemptById])

  const [phase, setPhase] = useState<'calculating' | 'results'>('calculating')
  const [displayScore, setDisplayScore] = useState(0)

  useEffect(() => {
    if (!attempt) return

    setPhase('calculating')
    setDisplayScore(0)

    const calculatingTimer = window.setTimeout(() => {
      setPhase('results')
    }, 800)

    return () => window.clearTimeout(calculatingTimer)
  }, [attempt?.id])

  useEffect(() => {
    if (phase !== 'results' || !attempt) return

    const controls = animate(0, attempt.score, {
      duration: 0.8,
      onUpdate: (value) => setDisplayScore(Math.round(value)),
    })

    return () => controls.stop()
  }, [phase, attempt])

  if (!attemptId || !attempt) {
    return <Navigate to="/" replace />
  }

  if (phase === 'calculating') {
    return (
      <PageWrapper>
        <div className="flex min-h-[40vh] items-center justify-center">
          <motion.p
            className="text-lg text-text-muted"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {t('results.calculatingScore')}
          </motion.p>
        </div>
      </PageWrapper>
    )
  }

  return (
    <PageWrapper title={t('results.title')}>
      <div className="mx-auto max-w-lg text-center">
        <p className="text-sm font-medium text-text-muted">
          {t('results.yourScore')}
        </p>
        <motion.p
          className="mt-2 font-display text-6xl font-bold text-indigo-600 tabular-nums"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          {displayScore}
        </motion.p>
        <p className="mt-1 text-text-muted">
          {t('results.totalPoints')}: {attempt.totalPoints}
        </p>

        <div className="mt-8 grid grid-cols-2 gap-4 text-left">
          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <p className="text-sm text-text-muted">{t('results.percentage')}</p>
            <p className="mt-1 text-2xl font-semibold text-text-primary">
              {attempt.percentage}%
            </p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <p className="text-sm text-text-muted">{t('results.timeTaken')}</p>
            <p className="mt-1 text-2xl font-semibold text-text-primary">
              {formatTimeTaken(attempt.timeTaken)}
            </p>
          </div>
        </div>
      </div>
    </PageWrapper>
  )
}
