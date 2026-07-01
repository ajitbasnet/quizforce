import { RefreshCw } from 'lucide-react'
import type { ReactNode } from 'react'
import { useLanguage } from '../../hooks/useLanguage'
import { Card } from '../ui/Card'
import { ErrorBoundary } from '../ui/ErrorBoundary'

interface WidgetErrorFallbackProps {
  onRetry: () => void
}

function WidgetErrorFallback({ onRetry }: WidgetErrorFallbackProps) {
  const { t } = useLanguage()

  return (
    <Card className="flex items-center gap-3 border border-danger-200 bg-danger-50/50 dark:border-danger-800 dark:bg-danger-950/30">
      <p className="flex-1 text-sm text-text-primary dark:text-gray-100">{t('errors.widgetTitle')}</p>
      <button
        type="button"
        onClick={onRetry}
        className="inline-flex shrink-0 items-center justify-center rounded-lg p-2 text-text-muted transition-colors hover:bg-danger-100 hover:text-danger-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger-500/40 dark:text-gray-400 dark:hover:bg-danger-900/50 dark:hover:text-danger-400"
        aria-label={t('errors.retry')}
      >
        <RefreshCw className="h-4 w-4" aria-hidden />
      </button>
    </Card>
  )
}

export function WidgetErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary
      fallback={(_error, reset) => <WidgetErrorFallback onRetry={reset} />}
    >
      {children}
    </ErrorBoundary>
  )
}
