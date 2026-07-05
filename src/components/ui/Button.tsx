import clsx from 'clsx'
import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { Spinner } from './Spinner'

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'success'
type ButtonSize = 'xs' | 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  isLoading?: boolean
  leftIcon?: ReactNode
  rightIcon?: ReactNode
  fullWidth?: boolean
}

const BASE_CLASSES =
  'inline-flex items-center justify-center gap-2 font-medium rounded-lg motion-safe:transition-[colors,transform,box-shadow] motion-safe:duration-micro active:scale-[0.97] motion-safe:active:duration-micro focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-950 disabled:opacity-50 disabled:pointer-events-none'

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary:
    'bg-brand-600 text-white hover:bg-brand-700 focus-visible:ring-brand-600 dark:hover:bg-brand-500 [@media(hover:hover)_and_(pointer:fine)]:motion-safe:hover:-translate-y-px [@media(hover:hover)_and_(pointer:fine)]:hover:shadow-elevation-1',
  secondary:
    'bg-surface text-brand-600 border border-brand-600 hover:bg-brand-50 focus-visible:ring-brand-600 dark:bg-gray-900 dark:text-indigo-400 dark:border-indigo-400 dark:hover:bg-gray-800',
  danger:
    'bg-danger-600 text-white hover:brightness-95 focus-visible:ring-danger-600',
  ghost:
    'bg-transparent text-text-primary hover:bg-surface-subtle focus-visible:ring-gray-400 dark:text-gray-100 dark:hover:bg-gray-800',
  success:
    'bg-success-600 text-white hover:brightness-95 focus-visible:ring-success-600',
}

const SIZE_CLASSES: Record<ButtonSize, string> = {
  xs: 'px-2 py-1 text-xs',
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
}

export function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  disabled,
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled || isLoading}
      aria-busy={isLoading}
      className={clsx(
        BASE_CLASSES,
        VARIANT_CLASSES[variant],
        SIZE_CLASSES[size],
        fullWidth && 'w-full',
        isLoading && 'relative',
        className,
      )}
      {...props}
    >
      {isLoading ? (
        <>
          <span className="invisible inline-flex items-center gap-2">
            {leftIcon}
            {children}
            {rightIcon}
          </span>
          <span
            className="absolute inset-0 flex items-center justify-center"
            aria-hidden
          >
            <Spinner size="sm" />
          </span>
        </>
      ) : (
        <>
          {leftIcon}
          {children}
          {rightIcon}
        </>
      )}
    </button>
  )
}
