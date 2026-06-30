import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useSpeechVoices } from '../hooks/useSpeechVoices'

describe('useSpeechVoices', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('loads voices from speechSynthesis after retry', () => {
    const mockVoice = { lang: 'en-US', voiceURI: 'voice-1' } as SpeechSynthesisVoice
    const getVoices = vi
      .fn()
      .mockReturnValueOnce([])
      .mockReturnValue([mockVoice])

    Object.defineProperty(window.speechSynthesis, 'getVoices', {
      configurable: true,
      value: getVoices,
    })
    Object.defineProperty(window.speechSynthesis, 'addEventListener', {
      configurable: true,
      value: vi.fn(),
    })
    Object.defineProperty(window.speechSynthesis, 'removeEventListener', {
      configurable: true,
      value: vi.fn(),
    })

    const { result } = renderHook(() => useSpeechVoices('en'))

    act(() => {
      vi.advanceTimersByTime(500)
    })

    expect(result.current.isLoading).toBe(false)
    expect(result.current.voices).toHaveLength(1)
  })
})
