import { describe, expect, it } from 'vitest'
import { getTagColorClass } from '../utils/tagColors'

describe('getTagColorClass', () => {
  it('returns a stable color class for the same tag', () => {
    expect(getTagColorClass('science')).toBe(getTagColorClass('science'))
  })

  it('returns one of the predefined palette classes', () => {
    const palette = [
      'bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300',
      'bg-success-100 text-success-600 dark:bg-success-950/50 dark:text-success-400',
      'bg-purple-100 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300',
      'bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300',
      'bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300',
      'bg-teal-100 text-teal-700 dark:bg-teal-950/50 dark:text-teal-300',
      'bg-brand-100 text-brand-700 dark:bg-indigo-950/50 dark:text-indigo-300',
      'bg-orange-100 text-orange-700 dark:bg-orange-950/50 dark:text-orange-300',
    ]
    expect(palette).toContain(getTagColorClass('history'))
  })
})
