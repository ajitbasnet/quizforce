import { describe, expect, it } from 'vitest'
import { getGradeKey, getGradeVoiceKey } from '../utils/scoreGrade'

describe('scoreGrade', () => {
  it('maps percentage to grade keys', () => {
    expect(getGradeKey(95)).toBe('results.gradeExcellent')
    expect(getGradeKey(75)).toBe('results.gradeGreat')
    expect(getGradeKey(55)).toBe('results.gradeGood')
    expect(getGradeKey(20)).toBe('results.gradeKeepPracticing')
  })

  it('maps percentage to voice grade keys', () => {
    expect(getGradeVoiceKey(90)).toBe('results.gradeExcellentVoice')
    expect(getGradeVoiceKey(70)).toBe('results.gradeGreatVoice')
    expect(getGradeVoiceKey(50)).toBe('results.gradeGoodVoice')
    expect(getGradeVoiceKey(10)).toBe('results.gradeKeepPracticingVoice')
  })
})
