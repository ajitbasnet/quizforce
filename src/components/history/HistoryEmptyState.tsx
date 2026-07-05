import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useLanguage } from '../../hooks/useLanguage'
import { useMotionTransition, useReducedMotion } from '../../hooks/useReducedMotion'
import { MOTION } from '../../utils/motionTokens'
import { EmptyHistoryIllustration } from '../illustrations/EmptyHistoryIllustration'
import { EmptySearchIllustration } from '../illustrations/EmptySearchIllustration'
import { Button } from '../ui/Button'

interface HistoryEmptyStateProps {
  variant: 'firstVisit' | 'noSearchResults'
  searchQuery?: string
  onClearSearch?: () => void
}

const EMPTY_ENTRANCE = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
} as const

export function HistoryEmptyState({
  variant,
  searchQuery = '',
  onClearSearch,
}: HistoryEmptyStateProps) {
  const { t } = useLanguage()
  const navigate = useNavigate()
  const prefersReducedMotion = useReducedMotion()
  const entranceTransition = useMotionTransition(0.3, MOTION.easeStandard)

  const motionProps = prefersReducedMotion
    ? {}
    : {
        initial: EMPTY_ENTRANCE.initial,
        animate: EMPTY_ENTRANCE.animate,
        transition: entranceTransition,
      }

  if (variant === 'noSearchResults') {
    return (
      <motion.div
        {...motionProps}
        className="flex flex-col items-center justify-center py-16 text-center"
      >
        <EmptySearchIllustration />
        <p className="mt-6 text-text-muted dark:text-gray-400">
          {t('history.noSearchResults', { query: searchQuery })}
        </p>
        {onClearSearch ? (
          <button
            type="button"
            onClick={onClearSearch}
            className="mt-3 text-sm font-medium text-brand-600 transition-colors hover:text-brand-700 dark:text-indigo-400 dark:hover:text-indigo-300"
          >
            {t('history.clearSearch')}
          </button>
        ) : null}
      </motion.div>
    )
  }

  return (
    <motion.div
      {...motionProps}
      className="flex flex-col items-center justify-center py-16 text-center"
    >
      <EmptyHistoryIllustration />
      <h2 className="mt-6 text-xl font-semibold text-text-primary dark:text-gray-100">
        {t('history.emptyTitle')}
      </h2>
      <p className="mt-2 max-w-sm text-text-muted dark:text-gray-400">
        {t('history.emptyDescription')}
      </p>
      <Button className="mt-6" size="lg" onClick={() => navigate('/')}>
        {t('history.createFirstQuiz')} →
      </Button>
    </motion.div>
  )
}
