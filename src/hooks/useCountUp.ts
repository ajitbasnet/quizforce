import { useEffect, useState } from 'react'

export function useCountUp(value: number, duration: number): number {
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
      setCount(Math.round(progress * value))

      if (progress < 1) {
        rafId = requestAnimationFrame(animate)
      }
    }

    setCount(0)
    rafId = requestAnimationFrame(animate)

    return () => cancelAnimationFrame(rafId)
  }, [value, duration])

  return count
}
