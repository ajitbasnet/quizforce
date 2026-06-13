export const HIGH_SCORE_THRESHOLD = 90

export type GradeKey =
  | 'results.gradeExcellent'
  | 'results.gradeGreat'
  | 'results.gradeGood'
  | 'results.gradeKeepPracticing'

export type GradeVoiceKey =
  | 'results.gradeExcellentVoice'
  | 'results.gradeGreatVoice'
  | 'results.gradeGoodVoice'
  | 'results.gradeKeepPracticingVoice'

export function getGradeKey(percentage: number): GradeKey {
  if (percentage >= HIGH_SCORE_THRESHOLD) return 'results.gradeExcellent'
  if (percentage >= 70) return 'results.gradeGreat'
  if (percentage >= 50) return 'results.gradeGood'
  return 'results.gradeKeepPracticing'
}

export function getGradeVoiceKey(percentage: number): GradeVoiceKey {
  if (percentage >= HIGH_SCORE_THRESHOLD) return 'results.gradeExcellentVoice'
  if (percentage >= 70) return 'results.gradeGreatVoice'
  if (percentage >= 50) return 'results.gradeGoodVoice'
  return 'results.gradeKeepPracticingVoice'
}
