import clsx from 'clsx'

type SpinnerSize = 'sm' | 'md' | 'lg'

const SIZE_CLASSES: Record<SpinnerSize, string> = {
  sm: 'h-4 w-4',
  md: 'h-8 w-8',
  lg: 'h-12 w-12',
}

export function Spinner({
  size = 'md',
  className,
}: {
  size?: SpinnerSize
  className?: string
}) {
  return (
    <div
      className={clsx(
        'animate-spin rounded-full border-2 border-primary border-t-transparent',
        SIZE_CLASSES[size],
        className,
      )}
    />
  )
}
