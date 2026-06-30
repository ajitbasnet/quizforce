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
        <div className="mb-1 flex justify-between text-sm text-text-muted">
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
          'w-full overflow-hidden rounded-full bg-gray-200',
          HEIGHT_CLASSES[height],
        )}
      >
        <div
          className={clsx(
            'relative h-full overflow-hidden rounded-full transition-[width] duration-300 ease-out',
            VARIANT_CLASSES[variant],
          )}
          style={{ width: `${clamped}%` }}
        >
          {animated && (
            <span className="absolute inset-0 animate-progress-shimmer bg-gradient-to-r from-transparent via-white/40 to-transparent" />
          )}
        </div>
      </div>
    </div>
  )
}
