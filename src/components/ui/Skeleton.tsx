import clsx from 'clsx'
import type { CSSProperties } from 'react'

const SHIMMER_CLASSES = 'rounded bg-gray-200 dark:bg-gray-700 animate-skeleton-shimmer'

export function Skeleton({
  className,
  style,
}: {
  className?: string
  style?: CSSProperties
}) {
  return (
    <div
      className={clsx(SHIMMER_CLASSES, className)}
      style={style}
      aria-hidden="true"
    />
  )
}

export function SkeletonText({
  className,
  width = 'w-full',
}: {
  className?: string
  width?: string
}) {
  return <Skeleton className={clsx('h-4', width, className)} />
}

export function SkeletonCircle({
  size = 40,
  className,
}: {
  size?: number
  className?: string
}) {
  return (
    <Skeleton
      className={clsx('shrink-0 rounded-full', className)}
      style={{ width: size, height: size }}
    />
  )
}

export function SkeletonButton({ className }: { className?: string }) {
  return <Skeleton className={clsx('h-10 rounded-lg', className)} />
}
