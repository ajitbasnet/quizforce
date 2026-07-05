import { describe, expect, it } from 'vitest'
import {
  LANG_MAP,
  matchesLangPrefix,
  pickDefaultVoiceURI,
  resolveLang,
} from '../utils/voiceLang'
import { useSettingsStore } from '../store/settingsStore'

function mockVoice(
  voiceURI: string,
  lang: string,
): SpeechSynthesisVoice {
  return { voiceURI, lang, name: voiceURI } as SpeechSynthesisVoice
}

describe('voiceLang', () => {
  it('resolves supported language codes to locale strings', () => {
    useSettingsStore.setState({
      settings: { ...useSettingsStore.getState().settings, language: 'fr' },
    })

    expect(resolveLang()).toBe(LANG_MAP.fr)
    expect(resolveLang('de')).toBe('de-DE')
  })

  it('passes through unknown locale strings', () => {
    expect(resolveLang('pt-BR')).toBe('pt-BR')
  })

  it('matches language prefixes case-insensitively', () => {
    expect(matchesLangPrefix('en-US', 'en-GB')).toBe(true)
    expect(matchesLangPrefix('en_US', 'en-gb')).toBe(true)
    expect(matchesLangPrefix('fr-FR', 'en-US')).toBe(false)
  })

  it('pickDefaultVoiceURI prefers exact locale match', () => {
    const voices = [
      mockVoice('en-gb', 'en-GB'),
      mockVoice('en-us', 'en-US'),
      mockVoice('hi-in', 'hi-IN'),
    ]

    expect(pickDefaultVoiceURI('en', voices)).toBe('en-us')
  })

  it('pickDefaultVoiceURI falls back to language prefix', () => {
    const voices = [
      mockVoice('en-gb', 'en-GB'),
      mockVoice('fr-ca', 'fr-CA'),
    ]

    expect(pickDefaultVoiceURI('en', voices)).toBe('en-gb')
    expect(pickDefaultVoiceURI('fr', voices)).toBe('fr-ca')
  })

  it('pickDefaultVoiceURI returns null when no voices match', () => {
    const voices = [mockVoice('de-de', 'de-DE')]

    expect(pickDefaultVoiceURI('hi', voices)).toBeNull()
    expect(pickDefaultVoiceURI('hi', [])).toBeNull()
  })
})
