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
  'inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none'

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary:
    'bg-indigo-600 text-white hover:bg-indigo-700 focus-visible:ring-indigo-600',
  secondary:
    'bg-white text-indigo-600 border border-indigo-600 hover:bg-indigo-50 focus-visible:ring-indigo-600',
  danger:
    'bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-600',
  ghost:
    'bg-transparent text-text-primary hover:bg-gray-100 focus-visible:ring-gray-400',
  success:
    'bg-green-600 text-white hover:bg-green-700 focus-visible:ring-green-600',
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
