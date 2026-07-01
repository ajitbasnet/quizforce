import clsx from 'clsx'
import type { ReactNode } from 'react'

type BadgeVariant = 'default' | 'success' | 'danger' | 'warning' | 'info'
type BadgeSize = 'sm' | 'md'

interface BadgeProps {
  children: ReactNode
  variant?: BadgeVariant
  size?: BadgeSize
  className?: string
}

const BASE_CLASSES = 'inline-flex items-center rounded-full font-bold'

const VARIANT_CLASSES: Record<BadgeVariant, string> = {
  default: 'bg-surface-subtle text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  success: 'bg-success-100 text-success-600 dark:bg-success-950 dark:text-success-400',
  danger: 'bg-danger-100 text-danger-600 dark:bg-danger-950 dark:text-danger-400',
  warning: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400',
  info: 'bg-brand-100 text-brand-700 dark:bg-indigo-950 dark:text-indigo-400',
}

const SIZE_CLASSES: Record<BadgeSize, string> = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-0.5 text-sm',
}

export function Badge({
  children,
  variant = 'default',
  size = 'md',
  className,
}: BadgeProps) {
  return (
    <span
      className={clsx(
        BASE_CLASSES,
        VARIANT_CLASSES[variant],
        SIZE_CLASSES[size],
        className
      )}
    >
      {children}
    </span>
  )
}
