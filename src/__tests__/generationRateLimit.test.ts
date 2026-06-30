import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { QuizGenerationError } from '../types/api'
import {
  assertGenerationAllowed,
  recordGeneration,
} from '../utils/generationRateLimit'

const STORAGE_KEY = 'quizforge:last-generation'

describe('generationRateLimit', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('allows generation when no prior record exists', () => {
    expect(() => assertGenerationAllowed()).not.toThrow()
  })

  it('blocks generation within the cooldown window', () => {
    recordGeneration()
    vi.advanceTimersByTime(5_000)

    expect(() => assertGenerationAllowed()).toThrow(QuizGenerationError)
    try {
      assertGenerationAllowed()
    } catch (error) {
      expect(error).toMatchObject({ code: 'RATE_LIMIT_CLIENT' })
    }
  })

  it('allows generation after the cooldown expires', () => {
    recordGeneration()
    vi.advanceTimersByTime(10_001)

    expect(() => assertGenerationAllowed()).not.toThrow()
  })

  it('records generation timestamp', () => {
    const now = 1_700_000_000_000
    vi.setSystemTime(now)
    recordGeneration()
    expect(localStorage.getItem(STORAGE_KEY)).toBe(String(now))
  })
})
