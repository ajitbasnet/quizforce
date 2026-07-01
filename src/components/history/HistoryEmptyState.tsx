import { useNavigate } from 'react-router-dom'
import { useLanguage } from '../../hooks/useLanguage'
import { EmptyHistoryIllustration } from '../illustrations/EmptyHistoryIllustration'
import { EmptySearchIllustration } from '../illustrations/EmptySearchIllustration'
import { Button } from '../ui/Button'

interface HistoryEmptyStateProps {
  variant: 'firstVisit' | 'noSearchResults'
  searchQuery?: string
  onClearSearch?: () => void
}

export function HistoryEmptyState({
  variant,
  searchQuery = '',
  onClearSearch,
}: HistoryEmptyStateProps) {
  const { t } = useLanguage()
  const navigate = useNavigate()

  if (variant === 'noSearchResults') {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <EmptySearchIllustration />
        <p className="mt-6 text-text-muted">
          {t('history.noSearchResults', { query: searchQuery })}
        </p>
        {onClearSearch ? (
          <button
            type="button"
            onClick={onClearSearch}
            className="mt-3 text-sm font-medium text-brand-600 transition-colors hover:text-brand-700"
          >
            {t('history.clearSearch')}
          </button>
        ) : null}
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <EmptyHistoryIllustration />
      <h2 className="mt-6 text-xl font-semibold text-text-primary">
        {t('history.emptyTitle')}
      </h2>
      <p className="mt-2 max-w-sm text-text-muted">{t('history.emptyDescription')}</p>
      <Button className="mt-6" size="lg" onClick={() => navigate('/')}>
        {t('history.createFirstQuiz')} →
      </Button>
    </div>
  )
}
