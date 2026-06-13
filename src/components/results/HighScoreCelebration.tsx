import { PREFERS_REDUCED_MOTION_QUERY, useMediaQuery } from '../../hooks/useMediaQuery'
import { HIGH_SCORE_THRESHOLD } from '../../utils/scoreGrade'
import { ConfettiCanvas } from './ConfettiCanvas'
import { SparkleCelebration } from './SparkleCelebration'

interface Props {
  percentage: number
}

export function HighScoreCelebration({ percentage }: Props) {
  const prefersReducedMotion = useMediaQuery(PREFERS_REDUCED_MOTION_QUERY)

  if (percentage < HIGH_SCORE_THRESHOLD) return null

  return prefersReducedMotion ? <SparkleCelebration /> : <ConfettiCanvas />
}
