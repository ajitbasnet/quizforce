import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useVoice } from '../hooks/useVoice'
import { useSettingsStore } from '../store/settingsStore'
import { useVoiceStore } from '../store/voiceStore'

class MockSpeechSynthesisUtterance {
  text: string
  rate = 1
  pitch = 1
  lang = ''
  voice: SpeechSynthesisVoice | null = null
  onstart: (() => void) | null = null
  onend: (() => void) | null = null
  onerror: (() => void) | null = null
  onpause: (() => void) | null = null
  onresume: (() => void) | null = null

  constructor(text: string) {
    this.text = text
  }
}

describe('useVoice', () => {
  const speakMock = vi.fn((utterance: MockSpeechSynthesisUtterance) => {
    utterance.onstart?.()
    utterance.onend?.()
  })
  const cancelMock = vi.fn()
  const pauseMock = vi.fn()
  const resumeMock = vi.fn()

  beforeEach(() => {
    vi.stubGlobal('SpeechSynthesisUtterance', MockSpeechSynthesisUtterance)

    Object.defineProperty(window, 'speechSynthesis', {
      configurable: true,
      writable: true,
      value: {
        speak: speakMock,
        cancel: cancelMock,
        pause: pauseMock,
        resume: resumeMock,
        getVoices: () => [],
      },
    })

    useVoiceStore.setState({
      isSpeaking: false,
      isPaused: false,
      currentText: '',
      lastSpokenText: '',
    })

    useSettingsStore.setState({
      settings: {
        ...useSettingsStore.getState().settings,
        voiceRate: 1,
        voicePitch: 1,
        voiceURI: null,
      },
    })

    speakMock.mockClear()
    cancelMock.mockClear()
    pauseMock.mockClear()
    resumeMock.mockClear()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('speaks text via speechSynthesis', () => {
    const { result } = renderHook(() => useVoice())

    act(() => {
      result.current.speak('Hello there')
    })

    expect(speakMock).toHaveBeenCalled()
    expect(useVoiceStore.getState().lastSpokenText).toBe('Hello there')
  })

  it('queues multiple utterances for speakSequence', () => {
    const { result } = renderHook(() => useVoice())

    speakMock.mockImplementation((utterance: MockSpeechSynthesisUtterance) => {
      utterance.onstart?.()
      utterance.onend?.()
    })

    act(() => {
      result.current.speakSequence(['First part.', 'Second part.'])
    })

    expect(speakMock).toHaveBeenCalled()
    const firstUtterance = speakMock.mock.calls[0]?.[0] as MockSpeechSynthesisUtterance
    expect(firstUtterance.text).toBe('First part.')
    expect(useVoiceStore.getState().lastSpokenText).toBe('First part. Second part.')
  })

  it('stops speech and clears voice state', () => {
    const { result } = renderHook(() => useVoice())

    act(() => {
      result.current.speak('To be stopped')
    })

    act(() => {
      result.current.stop()
    })

    expect(cancelMock).toHaveBeenCalled()
    expect(useVoiceStore.getState().currentText).toBe('')
    expect(useVoiceStore.getState().isSpeaking).toBe(false)
  })

  it('pauses and resumes when an utterance is active', () => {
    speakMock.mockImplementation(() => {
      // Keep utterance active without auto-ending
    })

    const { result } = renderHook(() => useVoice())

    act(() => {
      result.current.speak('Pause me')
    })

    act(() => {
      result.current.pause()
    })
    expect(pauseMock).toHaveBeenCalled()

    act(() => {
      result.current.resume()
    })
    expect(resumeMock).toHaveBeenCalled()
  })

  it('ignores empty speak calls', () => {
    const { result } = renderHook(() => useVoice())

    act(() => {
      result.current.speak('   ')
    })

    expect(speakMock).not.toHaveBeenCalled()
  })

  it('replays last spoken text with speakAgain', () => {
    const { result } = renderHook(() => useVoice())

    act(() => {
      result.current.speak('Replay this')
    })

    speakMock.mockClear()

    act(() => {
      result.current.speakAgain()
    })

    expect(speakMock).toHaveBeenCalled()
    const utterance = speakMock.mock.calls[0]?.[0] as MockSpeechSynthesisUtterance
    expect(utterance.text).toBe('Replay this')
  })

  it('speaks question then options in sequence', () => {
    const { result } = renderHook(() => useVoice())

    act(() => {
      result.current.speakQuestionThenOptions('What is 2+2?', ['Three', 'Four'])
    })

    expect(speakMock).toHaveBeenCalled()
    const utterance = speakMock.mock.calls[0]?.[0] as MockSpeechSynthesisUtterance
    expect(utterance.text).toBe('What is 2+2?')
  })

  it('returns no-op handlers when speech is unsupported', () => {
    const original = Object.getOwnPropertyDescriptor(window, 'speechSynthesis')
    Reflect.deleteProperty(window, 'speechSynthesis')

    const { result } = renderHook(() => useVoice())

    expect(result.current.isSupported).toBe(false)

    act(() => {
      result.current.speak('ignored')
      result.current.stop()
      result.current.pause()
      result.current.resume()
    })

    if (original) {
      Object.defineProperty(window, 'speechSynthesis', original)
    }
  })
})
