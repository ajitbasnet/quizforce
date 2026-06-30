import { useNavigate } from 'react-router-dom'
import { useLanguage } from '../../hooks/useLanguage'
import { Button } from '../ui/Button'

interface HistoryEmptyStateProps {
  hasQuizzes: boolean
}

function NotebookIllustration() {
  return (
    <svg
      width={120}
      height={120}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      className="text-gray-300"
    >
      <rect
        x="28"
        y="16"
        width="64"
        height="88"
        rx="6"
        className="fill-gray-100 stroke-current"
        strokeWidth="2"
      />
      <line
        x1="44"
        y1="16"
        x2="44"
        y2="104"
        className="stroke-current"
        strokeWidth="2"
      />
      <circle cx="36" cy="32" r="2" className="fill-current" />
      <circle cx="36" cy="48" r="2" className="fill-current" />
      <circle cx="36" cy="64" r="2" className="fill-current" />
      <line
        x1="52"
        y1="36"
        x2="80"
        y2="36"
        className="stroke-current"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <line
        x1="52"
        y1="48"
        x2="76"
        y2="48"
        className="stroke-current"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <line
        x1="52"
        y1="60"
        x2="72"
        y2="60"
        className="stroke-current"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M28 28C20 28 16 32 16 40V88C16 96 20 100 28 100"
        className="stroke-current"
        strokeWidth="2"
        fill="none"
      />
    </svg>
  )
}

export function HistoryEmptyState({ hasQuizzes }: HistoryEmptyStateProps) {
  const { t } = useLanguage()
  const navigate = useNavigate()

  if (hasQuizzes) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-text-muted">{t('history.noSearchResults')}</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <NotebookIllustration />
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
