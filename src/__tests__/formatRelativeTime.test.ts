import { describe, expect, it, vi } from 'vitest'
import { formatRelativeTime } from '../utils/formatRelativeTime'

describe('formatRelativeTime', () => {
  it('formats recent times relative to now', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-06-30T12:00:00.000Z'))

    const result = formatRelativeTime('2026-06-30T11:00:00.000Z', 'en-US')
    expect(result).toMatch(/hour/i)

    vi.useRealTimers()
  })

  it('returns raw string for invalid ISO input', () => {
    expect(formatRelativeTime('invalid', 'en-US')).toBe('invalid')
  })
})
