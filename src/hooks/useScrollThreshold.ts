import { useEffect, useRef, useState } from 'react'

/**
 * Returns true once the page has scrolled past `thresholdPx`.
 * Uses a sentinel element + IntersectionObserver (no window scroll listeners).
 */
export function useScrollThreshold(thresholdPx = 8) {
  const [isPastThreshold, setIsPastThreshold] = useState(false)
  const sentinelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const node = sentinelRef.current
    if (!node) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsPastThreshold(!entry.isIntersecting)
      },
      { threshold: 0 },
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [thresholdPx])

  return { isPastThreshold, sentinelRef, sentinelHeightPx: thresholdPx }
}
