import { describe, expect, it } from 'vitest'
import { clamp, splitIntoSentences } from '../utils/speechText'

describe('clamp', () => {
  it('clamps values below minimum', () => {
    expect(clamp(0.05, 0.1, 10)).toBe(0.1)
  })

  it('clamps values above maximum', () => {
    expect(clamp(15, 0.1, 10)).toBe(10)
  })

  it('returns value when within range', () => {
    expect(clamp(1.5, 0.1, 10)).toBe(1.5)
  })
})

describe('splitIntoSentences', () => {
  it('returns empty array for blank text', () => {
    expect(splitIntoSentences('   ')).toEqual([])
  })

  it('keeps short sentences in a single chunk', () => {
    expect(splitIntoSentences('Hello world. How are you? Fine!')).toEqual([
      'Hello world. How are you? Fine!',
    ])
  })

  it('merges short sentences under the chunk limit', () => {
    const sentences = Array.from({ length: 5 }, (_, i) => `Sentence ${i}.`).join(' ')
    const chunks = splitIntoSentences(sentences)

    expect(chunks).toHaveLength(1)
    expect(chunks[0]).toContain('Sentence 0.')
    expect(chunks[0]).toContain('Sentence 4.')
  })

  it('creates multiple chunks when merged length exceeds 3500 characters', () => {
    const longSentence = `${'word '.repeat(700).trim()}.`
    const chunks = splitIntoSentences(`${longSentence} ${longSentence}`)

    expect(chunks.length).toBeGreaterThan(1)
    expect(chunks[0]!.length).toBeLessThanOrEqual(3500)
    expect(chunks[1]!.length).toBeLessThanOrEqual(3500)
  })
})
