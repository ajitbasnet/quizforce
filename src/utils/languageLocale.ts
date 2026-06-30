import type { SupportedLanguage } from '../types/quiz'
import { LANG_MAP } from './voiceLang'

export const LANGUAGE_STORAGE_KEY = 'quizforge:language'

const SUPPORTED_LANGUAGE_CODES: SupportedLanguage[] = [
  'en',
  'es',
  'fr',
  'hi',
  'ne',
  'de',
  'zh',
]

export function isSupportedLanguage(lang: string): lang is SupportedLanguage {
  return SUPPORTED_LANGUAGE_CODES.includes(lang as SupportedLanguage)
}

export function toBcp47(lang: SupportedLanguage): string {
  return LANG_MAP[lang]
}

export function isRTL(_lang: SupportedLanguage): boolean {
  return false
}

export function applyDocumentLanguage(lang: SupportedLanguage): void {
  document.documentElement.lang = toBcp47(lang)
  document.documentElement.dir = isRTL(lang) ? 'rtl' : 'ltr'
}

export function persistLanguage(lang: SupportedLanguage): void {
  localStorage.setItem(LANGUAGE_STORAGE_KEY, lang)
}

export function readExplicitLanguage(): SupportedLanguage | null {
  try {
    const raw = localStorage.getItem(LANGUAGE_STORAGE_KEY)
    if (raw && isSupportedLanguage(raw)) return raw
  } catch {
    // ignore storage errors
  }
  return null
}
