export type GradeKey =
  | 'results.gradeExcellent'
  | 'results.gradeGreat'
  | 'results.gradeGood'
  | 'results.gradeKeepPracticing'

export function getGradeKey(percentage: number): GradeKey {
  if (percentage >= 90) return 'results.gradeExcellent'
  if (percentage >= 70) return 'results.gradeGreat'
  if (percentage >= 50) return 'results.gradeGood'
  return 'results.gradeKeepPracticing'
}
