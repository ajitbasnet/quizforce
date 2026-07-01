import type { Easing, SpringOptions, Transition } from 'framer-motion'
import { MOTION } from '../utils/motionTokens'
import { PREFERS_REDUCED_MOTION_QUERY, useMediaQuery } from './useMediaQuery'

const REDUCED_TRANSITION: Transition = { duration: 0 }
const REDUCED_SPRING: SpringOptions = { duration: 0 }

export function useReducedMotion(): boolean {
  return useMediaQuery(PREFERS_REDUCED_MOTION_QUERY)
}

export function useMotionTransition(
  duration: number,
  ease: Easing = MOTION.easeOut,
): Transition {
  const prefersReducedMotion = useReducedMotion()

  if (prefersReducedMotion) return REDUCED_TRANSITION

  return { duration, ease }
}

export function useMotionSpring(): SpringOptions {
  const prefersReducedMotion = useReducedMotion()

  if (prefersReducedMotion) return REDUCED_SPRING

  return MOTION.spring
}
