import { describe, expect, it, beforeEach } from 'vitest'
import {
  ONBOARDING_KEY,
  hasOnboarded,
  markOnboarded,
} from '../hooks/useOnboarding'

describe('useOnboarding', () => {
  beforeEach(() => {
    localStorage.removeItem(ONBOARDING_KEY)
  })

  it('returns false before onboarding is marked', () => {
    expect(hasOnboarded()).toBe(false)
  })

  it('persists onboarded state', () => {
    markOnboarded()
    expect(hasOnboarded()).toBe(true)
    expect(localStorage.getItem(ONBOARDING_KEY)).toBe('true')
  })
})
