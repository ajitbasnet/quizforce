import { describe, expect, it } from 'vitest'
import { formatCompletionDate, formatDuration } from '../utils/formatDate'

describe('formatDuration', () => {
  it('formats seconds only', () => {
    expect(formatDuration(45)).toBe('45s')
  })

  it('formats minutes and seconds', () => {
    expect(formatDuration(125)).toBe('2m 5s')
  })

  it('clamps negative values to zero', () => {
    expect(formatDuration(-10)).toBe('0s')
  })
})

describe('formatCompletionDate', () => {
  it('formats a valid ISO date', () => {
    const formatted = formatCompletionDate('2026-06-30T12:00:00.000Z', 'en-US')
    expect(formatted).toContain('2026')
  })

  it('returns the raw string for invalid dates', () => {
    expect(formatCompletionDate('not-a-date', 'en-US')).toBe('not-a-date')
  })
})
