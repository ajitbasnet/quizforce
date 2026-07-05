import clsx from 'clsx'

type ProgressBarHeight = 'thin' | 'default' | 'thick'
type ProgressBarVariant = 'primary' | 'success' | 'danger'

interface ProgressBarProps {
  value: number
  label?: string
  animated?: boolean
  height?: ProgressBarHeight
  variant?: ProgressBarVariant
  className?: string
  'data-testid'?: string
}

const HEIGHT_CLASSES: Record<ProgressBarHeight, string> = {
  thin: 'h-1',
  default: 'h-2',
  thick: 'h-3',
}

const VARIANT_CLASSES: Record<ProgressBarVariant, string> = {
  primary: 'bg-primary',
  success: 'bg-success-600',
  danger: 'bg-danger-600',
}

function clampValue(value: number): number {
  return Math.min(100, Math.max(0, value))
}

export function ProgressBar({
  value,
  label,
  animated = false,
  height = 'default',
  variant = 'primary',
  className,
  'data-testid': testId,
}: ProgressBarProps) {
  const clamped = clampValue(value)

  return (
    <div className={clsx('w-full', className)}>
      {label && (
        <div className="mb-1 flex justify-between text-sm text-text-muted dark:text-gray-400">
          <span>{label}</span>
          <span>{clamped}%</span>
        </div>
      )}
      <div
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label}
        data-testid={testId}
        className={clsx(
          'relative w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700',
          HEIGHT_CLASSES[height],
        )}
      >
        <div
          className={clsx(
            'absolute inset-0 origin-left overflow-hidden rounded-full motion-safe:transition-transform motion-safe:duration-standard motion-safe:ease-standard',
            VARIANT_CLASSES[variant],
          )}
          style={{ transform: `scaleX(${clamped / 100})` }}
        >
          {animated && (
            <span className="absolute inset-0 animate-progress-shimmer bg-gradient-to-r from-transparent via-white/40 to-transparent dark:via-white/20" />
          )}
        </div>
      </div>
    </div>
  )
}
