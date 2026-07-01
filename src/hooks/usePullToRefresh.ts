import { useEffect, useRef } from 'react'

interface UsePullToRefreshOptions {
  enabled: boolean
  onRefresh: () => void | Promise<void>
  threshold?: number
}

export function usePullToRefresh({
  enabled,
  onRefresh,
  threshold = 80,
}: UsePullToRefreshOptions): void {
  const startYRef = useRef(0)
  const pullingRef = useRef(false)
  const onRefreshRef = useRef(onRefresh)
  onRefreshRef.current = onRefresh

  useEffect(() => {
    if (!enabled) return

    const onTouchStart = (event: TouchEvent) => {
      if (window.scrollY > 0) return
      startYRef.current = event.touches[0]?.clientY ?? 0
      pullingRef.current = true
    }

    const onTouchMove = (event: TouchEvent) => {
      if (!pullingRef.current || window.scrollY > 0) return
      const y = event.touches[0]?.clientY ?? 0
      const delta = y - startYRef.current
      if (delta > 10) {
        event.preventDefault()
      }
    }

    const onTouchEnd = (event: TouchEvent) => {
      if (!pullingRef.current) return
      pullingRef.current = false
      const y = event.changedTouches[0]?.clientY ?? 0
      const delta = y - startYRef.current
      if (window.scrollY === 0 && delta >= threshold) {
        void onRefreshRef.current()
      }
    }

    document.addEventListener('touchstart', onTouchStart, { passive: true })
    document.addEventListener('touchmove', onTouchMove, { passive: false })
    document.addEventListener('touchend', onTouchEnd)
    document.addEventListener('touchcancel', onTouchEnd)

    return () => {
      document.removeEventListener('touchstart', onTouchStart)
      document.removeEventListener('touchmove', onTouchMove)
      document.removeEventListener('touchend', onTouchEnd)
      document.removeEventListener('touchcancel', onTouchEnd)
    }
  }, [enabled, threshold])
}
