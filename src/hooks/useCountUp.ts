import { useEffect, useState } from 'react'

const defaultEasing = (progress: number) => 1 - Math.pow(1 - progress, 3)

export function useCountUp(
  value: number,
  duration: number,
  easing: (progress: number) => number = defaultEasing,
): number {
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (duration <= 0) {
      setCount(Math.round(value))
      return
    }

    let startTime: number | null = null
    let rafId = 0

    const animate = (timestamp: number) => {
      if (startTime === null) startTime = timestamp
      const elapsed = timestamp - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = easing(progress)
      setCount(Math.round(eased * value))

      if (progress < 1) {
        rafId = requestAnimationFrame(animate)
      }
    }

    setCount(0)
    rafId = requestAnimationFrame(animate)

    return () => cancelAnimationFrame(rafId)
    // easing is intentionally omitted — callers should pass a stable reference
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, duration])

  return count
}
