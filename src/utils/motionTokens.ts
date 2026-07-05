import type { Target, Transition } from 'framer-motion'

/** Shared animation durations, springs, and easing curves for Framer Motion. */
export const MOTION = {
  instant: 0.1,
  fast: 0.2,
  medium: 0.35,
  slow: 0.6,
  spring: { stiffness: 300, damping: 25 },
  easeOut: [0, 0, 0.2, 1] as const,
  easeIn: [0.4, 0, 1, 1] as const,
  easeStandard: [0.4, 0, 0.2, 1] as const,
  easeEmphasis: [0.34, 1.56, 0.64, 1] as const,
  maxDuration: 2,
  duration: {
    micro: 0.15,
    standard: 0.25,
    page: 0.35,
    exit: 0.15,
  },
} as const

export type MotionPresetName = keyof typeof MOTION_PRESETS

export type MotionPreset = {
  initial?: Target | false
  animate?: Target
  exit?: Target
  transition: Transition
}

const standardTransition = (): Transition => ({
  duration: MOTION.duration.standard,
  ease: MOTION.easeStandard,
})

const exitTransition = (): Transition => ({
  duration: MOTION.duration.exit,
  ease: MOTION.easeStandard,
})

/** Named enter/exit configs consumed by route, modal, and quiz transitions. */
export const MOTION_PRESETS = {
  enterPage: {
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 },
    transition: standardTransition(),
  },
  exitPage: {
    exit: { opacity: 0, y: -8 },
    transition: exitTransition(),
  },
  enterModal: {
    initial: { opacity: 0, scale: 0.96 },
    animate: { opacity: 1, scale: 1 },
    transition: standardTransition(),
  },
  exitModal: {
    exit: { opacity: 0, scale: 0.98 },
    transition: exitTransition(),
  },
  questionSlide: {
    transition: {
      duration: MOTION.fast,
      ease: MOTION.easeStandard,
    },
  },
} satisfies Record<string, MotionPreset>

/** Caps stagger so list reveals stay within ~300ms total. */
export function cappedStaggerDelay(
  index: number,
  stepMs = 50,
  maxMs = 300,
): number {
  return Math.min(index * stepMs, maxMs)
}
