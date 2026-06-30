import { describe, expect, it } from 'vitest'
import {
  applyDocumentLanguage,
  isSupportedLanguage,
  persistLanguage,
  readExplicitLanguage,
  toBcp47,
} from '../utils/languageLocale'

describe('languageLocale', () => {
  it('identifies supported languages', () => {
    expect(isSupportedLanguage('en')).toBe(true)
    expect(isSupportedLanguage('xx')).toBe(false)
  })

  it('maps to BCP-47 locale strings', () => {
    expect(toBcp47('fr')).toBe('fr-FR')
  })

  it('persists and reads explicit language', () => {
    persistLanguage('de')
    expect(readExplicitLanguage()).toBe('de')
  })

  it('updates document language attributes', () => {
    applyDocumentLanguage('es')
    expect(document.documentElement.lang).toBe('es-ES')
    expect(document.documentElement.dir).toBe('ltr')
  })
})
