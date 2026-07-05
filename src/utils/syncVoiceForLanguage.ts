import { useSettingsStore } from '../store/settingsStore'
import type { SupportedLanguage } from '../types/quiz'
import { pickDefaultVoiceURI } from './voiceLang'

export function syncVoiceForLanguage(lang: SupportedLanguage): void {
  if (typeof window === 'undefined' || !window.speechSynthesis) return

  window.speechSynthesis.cancel()
  const voices = window.speechSynthesis.getVoices()
  const voiceURI = pickDefaultVoiceURI(lang, voices)
  useSettingsStore.getState().updateSettings({ voiceURI })
}
