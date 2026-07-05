import { useEffect, useRef, useState, type RefObject } from 'react'
import { cappedStaggerDelay } from '../utils/motionTokens'

export interface UseInViewRevealOptions {
  /** Intersection ratio threshold (0–1). Default 0.1 */
  threshold?: number
  rootMargin?: string
  /** Observe once and keep revealed. Default true */
  once?: boolean
}

export interface UseInViewRevealResult<T extends Element> {
  ref: RefObject<T | null>
  isInView: boolean
  /** Index-based delay capped for staggered list entrances. */
  staggerDelay: (index: number, stepMs?: number, maxMs?: number) => number
}

export function useInViewReveal<T extends Element = HTMLDivElement>(
  options: UseInViewRevealOptions = {},
): UseInViewRevealResult<T> {
  const { threshold = 0.1, rootMargin = '0px', once = true } = options
  const ref = useRef<T>(null)
  const [isInView, setIsInView] = useState(false)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true)
          if (once) observer.disconnect()
        } else if (!once) {
          setIsInView(false)
        }
      },
      { threshold, rootMargin },
    )

    observer.observe(element)
    return () => observer.disconnect()
  }, [threshold, rootMargin, once])

  return {
    ref,
    isInView,
    staggerDelay: cappedStaggerDelay,
  }
}
