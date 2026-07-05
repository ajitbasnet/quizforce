import { describe, expect, it } from 'vitest'
import {
  DEFAULT_QUIZ_SETTINGS,
  normalizeQuizSettings,
} from '../utils/normalizeQuizSettings'

describe('normalizeQuizSettings', () => {
  it('fills legacy persisted settings missing new fields', () => {
    const legacy = {
      pointsPerQuestion: 10,
      questionsCount: 10,
      difficulty: 'mixed' as const,
      voiceEnabled: false,
      voiceRate: 1,
      voicePitch: 1,
      language: 'en' as const,
    }

    expect(normalizeQuizSettings(legacy)).toEqual({
      ...DEFAULT_QUIZ_SETTINGS,
      ...legacy,
      customPointsMap: {},
      voiceURI: null,
      timerEnabled: false,
    })
  })
})
