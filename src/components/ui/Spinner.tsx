import clsx from 'clsx'

type SpinnerSize = 'sm' | 'md' | 'lg'

const SIZE_CLASSES: Record<SpinnerSize, string> = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-10 w-10',
}

export function Spinner({
  size = 'md',
  className,
}: {
  size?: SpinnerSize
  className?: string
}) {
  return (
    <svg
      role="status"
      aria-label="Loading"
      viewBox="0 0 24 24"
      className={clsx(SIZE_CLASSES[size], className)}
    >
      <circle
        cx="12"
        cy="12"
        r="10"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray="31.4 31.4"
        className="animate-spinner-dash"
      />
    </svg>
  )
}
