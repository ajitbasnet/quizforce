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

export const SUPPORTED_LANGUAGES: { code: SupportedLanguage; label: string }[] = [
  { code: 'en', label: 'English' },
  { code: 'es', label: 'Español' },
  { code: 'fr', label: 'Français' },
  { code: 'hi', label: 'हिन्दी' },
  { code: 'ne', label: 'नेपाली' },
  { code: 'de', label: 'Deutsch' },
  { code: 'zh', label: '中文' },
]

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
