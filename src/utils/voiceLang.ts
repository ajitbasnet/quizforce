import { useSettingsStore } from '../store/settingsStore'
import type { SupportedLanguage } from '../types/quiz'

export const LANG_MAP: Record<SupportedLanguage, string> = {
  en: 'en-US',
  es: 'es-ES',
  fr: 'fr-FR',
  hi: 'hi-IN',
  ne: 'ne-NP',
  de: 'de-DE',
  zh: 'zh-CN',
}

export function resolveLang(lang?: string): string {
  const { language } = useSettingsStore.getState().settings
  if (lang) {
    if (lang in LANG_MAP) {
      return LANG_MAP[lang as SupportedLanguage]
    }
    return lang
  }
  return LANG_MAP[language] ?? 'en-US'
}

export function matchesLangPrefix(voiceLang: string, targetLang: string): boolean {
  const normalizedVoice = voiceLang.replace('_', '-').toLowerCase()
  const normalizedTarget = targetLang.replace('_', '-').toLowerCase()
  const voicePrefix = normalizedVoice.split('-')[0]
  const targetPrefix = normalizedTarget.split('-')[0]
  return voicePrefix === targetPrefix
}
