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
        'bg-surface rounded-card p-4 shadow-sm dark:bg-gray-900 dark:shadow-none dark:border dark:border-gray-800',
        isClickable
          ? 'cursor-pointer motion-safe:transition-[transform,box-shadow,border-color] motion-safe:duration-standard motion-safe:ease-standard [@media(hover:hover)_and_(pointer:fine)]:motion-safe:hover:scale-[1.01] [@media(hover:hover)_and_(pointer:fine)]:hover:shadow-elevation-2 [@media(hover:hover)_and_(pointer:fine)]:hover:border-brand-200 dark:[@media(hover:hover)_and_(pointer:fine)]:hover:border-gray-600'
          : 'motion-safe:transition-shadow motion-safe:duration-standard',
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
