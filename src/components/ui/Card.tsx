import clsx from 'clsx'
import type { KeyboardEvent, ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
  onClick?: () => void
}

export function Card({ children, className, onClick }: CardProps) {
  const isClickable = Boolean(onClick)

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (!onClick) return
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      onClick()
    }
  }

  return (
    <div
      className={clsx(
        'bg-surface rounded-card p-4 shadow-sm transition-shadow duration-200 ease-out hover:shadow-md dark:bg-gray-900 dark:shadow-none dark:border dark:border-gray-800',
        isClickable && 'cursor-pointer',
        className
      )}
      onClick={onClick}
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onKeyDown={isClickable ? handleKeyDown : undefined}
    >
      {children}
    </div>
  )
}
