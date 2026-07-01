import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLanguage } from '../../hooks/useLanguage'
import { Button } from '../ui/Button'
import { ErrorBoundary } from '../ui/ErrorBoundary'

function ErrorIllustration() {
  return (
    <svg
      width={120}
      height={120}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      className="text-brand-300"
    >
      <circle cx="60" cy="60" r="48" className="fill-brand-50 stroke-current dark:fill-gray-800" strokeWidth="2" />
      <path
        d="M60 36v32"
        className="stroke-current"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <circle cx="60" cy="80" r="3" className="fill-current" />
    </svg>
  )
}

interface PageErrorFallbackProps {
  error: Error
  onRetry: () => void
}

function PageErrorFallback({ error, onRetry }: PageErrorFallbackProps) {
  const { t } = useLanguage()
  const navigate = useNavigate()

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center px-4 py-12 text-center">
      <ErrorIllustration />
      <h1 className="mt-6 text-xl font-semibold text-text-primary dark:text-gray-100">
        {t('errors.pageTitle')}
      </h1>
      <pre className="mt-3 max-w-lg overflow-x-auto rounded-lg bg-surface-subtle px-4 py-2 text-left text-sm text-text-muted dark:bg-gray-800 dark:text-gray-400">
        {error.message}
      </pre>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <Button onClick={onRetry}>{t('errors.retry')}</Button>
        <Button variant="secondary" onClick={() => navigate('/')}>
          {t('errors.goHome')}
        </Button>
      </div>
    </div>
  )
}

export function PageErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary
      fallback={(error, reset) => (
        <PageErrorFallback error={error} onRetry={reset} />
      )}
    >
      {children}
    </ErrorBoundary>
  )
}
