import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import type { SupportedLanguage } from '../types/quiz'
import de from './de.json'
import en from './en.json'
import es from './es.json'
import fr from './fr.json'
import hi from './hi.json'
import ne from './ne.json'
import zh from './zh.json'

export const STORAGE_KEY = 'quizforge-settings'

const SUPPORTED_LANGUAGE_CODES: SupportedLanguage[] = [
  'en',
  'es',
  'fr',
  'hi',
  'ne',
  'de',
  'zh',
]

export interface LanguageOption {
  code: SupportedLanguage
  flag: string
  nativeName: string
  englishName: string
}

export const LANGUAGE_OPTIONS: LanguageOption[] = [
  { code: 'en', flag: '🇬🇧', nativeName: 'English', englishName: 'English' },
  { code: 'es', flag: '🇪🇸', nativeName: 'Español', englishName: 'Spanish' },
  { code: 'fr', flag: '🇫🇷', nativeName: 'Français', englishName: 'French' },
  { code: 'hi', flag: '🇮🇳', nativeName: 'हिन्दी', englishName: 'Hindi' },
  { code: 'ne', flag: '🇳🇵', nativeName: 'नेपाली', englishName: 'Nepali' },
  { code: 'de', flag: '🇩🇪', nativeName: 'Deutsch', englishName: 'German' },
  { code: 'zh', flag: '🇨🇳', nativeName: '中文', englishName: 'Chinese' },
]

export const SUPPORTED_LANGUAGES: { code: SupportedLanguage; label: string }[] =
  LANGUAGE_OPTIONS.map(({ code, nativeName }) => ({ code, label: nativeName }))

function isSupportedLanguage(lang: string): lang is SupportedLanguage {
  return SUPPORTED_LANGUAGE_CODES.includes(lang as SupportedLanguage)
}

function getPersistedLanguage(): SupportedLanguage {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return 'en'

    const parsed = JSON.parse(raw) as {
      state?: { settings?: { language?: string } }
    }
    const lang = parsed?.state?.settings?.language

    if (lang && isSupportedLanguage(lang)) return lang
  } catch {
    // ignore parse errors
  }

  return 'en'
}

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    es: { translation: es },
    fr: { translation: fr },
    hi: { translation: hi },
    ne: { translation: ne },
    de: { translation: de },
    zh: { translation: zh },
  },
  lng: getPersistedLanguage(),
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
})

document.documentElement.lang = i18n.language

export default i18n
