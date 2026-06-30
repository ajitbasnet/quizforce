import { describe, expect, it } from 'vitest'
import { getTagColorClass } from '../utils/tagColors'

describe('getTagColorClass', () => {
  it('returns a stable color class for the same tag', () => {
    expect(getTagColorClass('science')).toBe(getTagColorClass('science'))
  })

  it('returns one of the predefined palette classes', () => {
    const palette = [
      'bg-blue-100 text-blue-700',
      'bg-success-100 text-success-600',
      'bg-purple-100 text-purple-700',
      'bg-amber-100 text-amber-700',
      'bg-rose-100 text-rose-700',
      'bg-teal-100 text-teal-700',
      'bg-brand-100 text-brand-700',
      'bg-orange-100 text-orange-700',
    ]
    expect(palette).toContain(getTagColorClass('history'))
  })
})
