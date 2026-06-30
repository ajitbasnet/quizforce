import { describe, expect, it } from 'vitest'
import { isSpeechSupported } from '../utils/speechSupport'

describe('isSpeechSupported', () => {
  it('returns true when speechSynthesis exists on window', () => {
    expect('speechSynthesis' in window).toBe(true)
    expect(isSpeechSupported()).toBe(true)
  })

  it('returns false when speechSynthesis is absent from window', () => {
    const original = Object.getOwnPropertyDescriptor(window, 'speechSynthesis')
    Reflect.deleteProperty(window, 'speechSynthesis')

    expect(isSpeechSupported()).toBe(false)

    if (original) {
      Object.defineProperty(window, 'speechSynthesis', original)
    }
  })
})
