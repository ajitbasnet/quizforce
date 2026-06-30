import { describe, expect, it } from 'vitest'
import { stripHtmlTags } from '../utils/sanitizeText'

describe('stripHtmlTags', () => {
  it('returns plain text unchanged', () => {
    expect(stripHtmlTags('Hello world')).toBe('Hello world')
  })

  it('strips HTML tags', () => {
    expect(stripHtmlTags('<p>Hello <strong>world</strong></p>')).toBe('Hello world')
  })

  it('handles empty input', () => {
    expect(stripHtmlTags('')).toBe('')
  })
})
