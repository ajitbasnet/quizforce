import clsx from 'clsx'
import { useEffect, useRef, useState, type ReactNode } from 'react'

interface ScrollFadeEdgesProps {
  children: ReactNode
  className?: string
  /** Classes applied to the scroll container. */
  scrollClassName?: string
}

/**
 * Wraps scrollable content with top/bottom gradient fades when more content
 * exists off-screen. Uses IntersectionObserver on sentinel elements inside
 * the scroll root — no window scroll listeners.
 */
export function ScrollFadeEdges({
  children,
  className,
  scrollClassName,
}: ScrollFadeEdgesProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const topSentinelRef = useRef<HTMLDivElement>(null)
  const bottomSentinelRef = useRef<HTMLDivElement>(null)
  const [showTopFade, setShowTopFade] = useState(false)
  const [showBottomFade, setShowBottomFade] = useState(false)

  useEffect(() => {
    const root = scrollRef.current
    const topSentinel = topSentinelRef.current
    const bottomSentinel = bottomSentinelRef.current
    if (!root || !topSentinel || !bottomSentinel) return

    const topObserver = new IntersectionObserver(
      ([entry]) => setShowTopFade(!entry.isIntersecting),
      { root, threshold: 0 },
    )
    const bottomObserver = new IntersectionObserver(
      ([entry]) => setShowBottomFade(!entry.isIntersecting),
      { root, threshold: 0 },
    )

    topObserver.observe(topSentinel)
    bottomObserver.observe(bottomSentinel)

    return () => {
      topObserver.disconnect()
      bottomObserver.disconnect()
    }
  }, [])

  return (
    <div className={clsx('relative', className)}>
      <div
        ref={scrollRef}
        className={clsx('h-full overflow-y-auto', scrollClassName)}
      >
        <div
          ref={topSentinelRef}
          className="pointer-events-none h-px w-full shrink-0"
          aria-hidden="true"
        />
        {children}
        <div
          ref={bottomSentinelRef}
          className="pointer-events-none h-px w-full shrink-0"
          aria-hidden="true"
        />
      </div>

      <div
        aria-hidden="true"
        className={clsx(
          'pointer-events-none absolute inset-x-0 top-0 z-10 h-6 bg-gradient-to-b from-white to-transparent transition-opacity duration-standard ease-standard dark:from-gray-900',
          showTopFade ? 'opacity-100' : 'opacity-0',
        )}
      />
      <div
        aria-hidden="true"
        className={clsx(
          'pointer-events-none absolute inset-x-0 bottom-0 z-10 h-6 bg-gradient-to-t from-white to-transparent transition-opacity duration-standard ease-standard dark:from-gray-900',
          showBottomFade ? 'opacity-100' : 'opacity-0',
        )}
      />
    </div>
  )
}
