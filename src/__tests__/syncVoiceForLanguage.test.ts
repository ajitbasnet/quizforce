import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useSettingsStore } from '../store/settingsStore'
import { syncVoiceForLanguage } from '../utils/syncVoiceForLanguage'

describe('syncVoiceForLanguage', () => {
  const cancelMock = vi.fn()

  beforeEach(() => {
    useSettingsStore.setState({
      settings: {
        ...useSettingsStore.getState().settings,
        voiceURI: 'en-us',
      },
    })

    Object.defineProperty(window, 'speechSynthesis', {
      configurable: true,
      writable: true,
      value: {
        cancel: cancelMock,
        getVoices: () => [
          { voiceURI: 'en-us', lang: 'en-US', name: 'English' },
          { voiceURI: 'hi-in', lang: 'hi-IN', name: 'Hindi' },
        ],
      },
    })

    cancelMock.mockClear()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('cancels speech and updates voiceURI to match target language', () => {
    syncVoiceForLanguage('hi')

    expect(cancelMock).toHaveBeenCalled()
    expect(useSettingsStore.getState().settings.voiceURI).toBe('hi-in')
  })

  it('no-ops when speech synthesis is unavailable', () => {
    Reflect.deleteProperty(window, 'speechSynthesis')

    syncVoiceForLanguage('hi')

    expect(useSettingsStore.getState().settings.voiceURI).toBe('en-us')
  })
})
