/** Shared animation durations, springs, and easing curves for Framer Motion. */
export const MOTION = {
  instant: 0.1,
  fast: 0.2,
  medium: 0.35,
  slow: 0.6,
  spring: { stiffness: 300, damping: 25 },
  easeOut: [0, 0, 0.2, 1] as const,
  easeIn: [0.4, 0, 1, 1] as const,
  maxDuration: 2,
} as const
