import clsx from 'clsx'
import { AlertCircle, X } from 'lucide-react'
import { Button } from './Button'

interface ErrorBannerProps {
  message: string
  suggestion?: string
  onRetry?: () => void
  onDismiss?: () => void
  retryLabel?: string
  className?: string
}

export function ErrorBanner({
  message,
  suggestion,
  onRetry,
  onDismiss,
  retryLabel = 'Try Again',
  className,
}: ErrorBannerProps) {
  return (
    <div
      role="alert"
      className={clsx(
        'flex items-start gap-3 rounded-lg border-l-4 border-danger-500 bg-danger-50 px-4 py-3 text-sm text-danger-600 dark:bg-danger-950/50 dark:text-danger-400',
        className,
      )}
    >
      <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden />
      <div className="flex flex-1 flex-col gap-2">
        <p>{message}</p>
        {suggestion && <p className="text-text-muted dark:text-gray-400">{suggestion}</p>}
        {onRetry && (
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="self-start"
            onClick={onRetry}
          >
            {retryLabel}
          </Button>
        )}
      </div>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="shrink-0 rounded p-0.5 text-danger-600 transition-colors hover:bg-danger-100 focus:outline-none focus:ring-2 focus:ring-danger-600 focus:ring-offset-2 dark:text-danger-400 dark:hover:bg-danger-900 dark:focus:ring-offset-gray-950"
          aria-label="Dismiss error"
        >
          <X className="h-4 w-4" aria-hidden />
        </button>
      )}
    </div>
  )
}
