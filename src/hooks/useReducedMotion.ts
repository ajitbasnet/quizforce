import type { Easing, SpringOptions, Transition } from 'framer-motion'
import {
  MOTION,
  MOTION_PRESETS,
  type MotionPreset,
  type MotionPresetName,
} from '../utils/motionTokens'
import { PREFERS_REDUCED_MOTION_QUERY, useMediaQuery } from './useMediaQuery'

export const HOVER_CAPABLE_QUERY = '(hover: hover) and (pointer: fine)'

const REDUCED_TRANSITION: Transition = { duration: 0 }
const REDUCED_SPRING: SpringOptions = { duration: 0 }

export function useReducedMotion(): boolean {
  return useMediaQuery(PREFERS_REDUCED_MOTION_QUERY)
}

export function useHoverCapable(): boolean {
  return useMediaQuery(HOVER_CAPABLE_QUERY)
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

export function useMotionPreset(name: MotionPresetName): MotionPreset {
  const prefersReducedMotion = useReducedMotion()
  const preset = MOTION_PRESETS[name]

  if (prefersReducedMotion) {
    return {
      initial: false,
      animate: 'animate' in preset ? preset.animate : undefined,
      exit: 'exit' in preset ? preset.exit : undefined,
      transition: REDUCED_TRANSITION,
    }
  }

  return preset
}
