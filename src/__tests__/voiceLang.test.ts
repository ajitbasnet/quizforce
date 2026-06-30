import { describe, expect, it } from 'vitest'
import { LANG_MAP, matchesLangPrefix, resolveLang } from '../utils/voiceLang'
import { useSettingsStore } from '../store/settingsStore'

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
})
