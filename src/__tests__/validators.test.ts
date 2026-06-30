import { describe, expect, it } from 'vitest'
import {
  pdfSchema,
  promptSchema,
  settingsSchema,
  textInputSchema,
  translateValidationMessage,
  validateQuizInput,
} from '../utils/validators'

describe('textInputSchema', () => {
  it('accepts valid text within bounds', () => {
    const text = 'a'.repeat(50)
    expect(textInputSchema.safeParse(text).success).toBe(true)
  })

  it('rejects text shorter than 50 characters', () => {
    const result = textInputSchema.safeParse('too short')
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe('input.textMinLengthError')
    }
  })

  it('rejects text longer than max characters', () => {
    const result = textInputSchema.safeParse('a'.repeat(20_001))
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe('input.textMaxLengthError')
    }
  })
})

describe('pdfSchema', () => {
  it('accepts extracted text at or above minimum length', () => {
    expect(pdfSchema.safeParse('a'.repeat(100)).success).toBe(true)
  })

  it('rejects extracted text below minimum length', () => {
    const result = pdfSchema.safeParse('short')
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe('input.pdfTooShort')
    }
  })
})

describe('promptSchema', () => {
  const validPrompt = {
    topic: 'Algebra',
    subtopics: 'Linear equations',
    audience: 'high_school' as const,
    customAudience: '',
    specialInstructions: '',
  }

  it('accepts valid prompt fields', () => {
    expect(promptSchema.safeParse(validPrompt).success).toBe(true)
  })

  it('rejects topic shorter than 3 characters', () => {
    const result = promptSchema.safeParse({ ...validPrompt, topic: 'ab' })
    expect(result.success).toBe(false)
  })

  it('requires customAudience when audience is custom', () => {
    const result = promptSchema.safeParse({
      ...validPrompt,
      audience: 'custom',
      customAudience: '   ',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe(
        'input.customAudienceRequiredError',
      )
    }
  })
})

describe('settingsSchema', () => {
  const validSettings = {
    questionsCount: 10,
    pointsPerQuestion: 10,
    difficulty: 'mixed' as const,
    language: 'en' as const,
    voiceEnabled: true,
    timerEnabled: false,
    voiceRate: 1,
    voicePitch: 1,
    voiceURI: null,
    customPointsMap: { q1: 15 },
  }

  it('accepts valid settings', () => {
    expect(settingsSchema.safeParse(validSettings).success).toBe(true)
  })

  it('rejects questionsCount outside 5–50', () => {
    expect(settingsSchema.safeParse({ ...validSettings, questionsCount: 4 }).success).toBe(
      false,
    )
    expect(settingsSchema.safeParse({ ...validSettings, questionsCount: 51 }).success).toBe(
      false,
    )
  })

  it('rejects invalid voice rate and pitch', () => {
    expect(settingsSchema.safeParse({ ...validSettings, voiceRate: 0.4 }).success).toBe(
      false,
    )
    expect(settingsSchema.safeParse({ ...validSettings, voicePitch: 2.1 }).success).toBe(
      false,
    )
  })
})

describe('translateValidationMessage', () => {
  it('translates i18n keys via t()', () => {
    const t = (key: string) => `translated:${key}`
    expect(translateValidationMessage('input.textMinLengthError', t)).toBe(
      'translated:input.textMinLengthError',
    )
  })

  it('returns undefined for empty message and passes through unknown strings', () => {
    const t = (key: string) => key
    expect(translateValidationMessage(undefined, t)).toBeUndefined()
    expect(translateValidationMessage('Plain error', t)).toBe('Plain error')
  })
})

describe('validateQuizInput', () => {
  it('always returns true (placeholder)', () => {
    expect(validateQuizInput({})).toBe(true)
  })
})
