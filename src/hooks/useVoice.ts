import { useCallback, useRef } from 'react'
import { useSettingsStore } from '../store/settingsStore'
import { useVoiceStore } from '../store/voiceStore'
import type { SupportedLanguage } from '../types/quiz'

const LANG_MAP: Record<SupportedLanguage, string> = {
  en: 'en-US',
  es: 'es-ES',
  fr: 'fr-FR',
  hi: 'hi-IN',
  ne: 'ne-NP',
  de: 'de-DE',
  zh: 'zh-CN',
}

const isSupported =
  typeof window !== 'undefined' && 'speechSynthesis' in window

let hasWarnedUnsupported = false

function noop() {}

function resolveLang(lang?: string): string {
  const { language } = useSettingsStore.getState().settings
  if (lang) {
    if (lang in LANG_MAP) {
      return LANG_MAP[lang as SupportedLanguage]
    }
    return lang
  }
  return LANG_MAP[language] ?? 'en-US'
}

export function useVoice() {
  const isSpeaking = useVoiceStore((s) => s.isSpeaking)
  const isPaused = useVoiceStore((s) => s.isPaused)
  const currentText = useVoiceStore((s) => s.currentText)
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)

  if (!isSupported && !hasWarnedUnsupported) {
    hasWarnedUnsupported = true
    console.warn('Text-to-speech is not supported in this browser.')
  }

  const stop = useCallback(() => {
    if (!isSupported) return
    window.speechSynthesis.cancel()
    utteranceRef.current = null
    useVoiceStore.getState().clearVoice()
  }, [])

  const pause = useCallback(() => {
    if (!isSupported || !utteranceRef.current) return
    window.speechSynthesis.pause()
  }, [])

  const resume = useCallback(() => {
    if (!isSupported) return
    window.speechSynthesis.resume()
  }, [])

  const speak = useCallback((text: string, lang?: string) => {
    if (!isSupported || !text.trim()) return

    const { setSpeaking, setPaused, setCurrentText, clearVoice } =
      useVoiceStore.getState()

    window.speechSynthesis.cancel()
    utteranceRef.current = null
    clearVoice()

    const { voiceRate, voicePitch } = useSettingsStore.getState().settings

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = voiceRate
    utterance.pitch = voicePitch
    utterance.lang = resolveLang(lang)

    utterance.onstart = () => setSpeaking(true)
    utterance.onend = () => {
      if (utteranceRef.current === utterance) {
        utteranceRef.current = null
        useVoiceStore.getState().endSpeech()
      }
    }
    utterance.onerror = () => {
      if (utteranceRef.current === utterance) {
        utteranceRef.current = null
        useVoiceStore.getState().endSpeech()
      }
    }
    utterance.onpause = () => setPaused(true)
    utterance.onresume = () => setPaused(false)

    setCurrentText(text)
    utteranceRef.current = utterance
    window.speechSynthesis.speak(utterance)
  }, [])

  if (!isSupported) {
    return {
      speak: noop,
      stop: noop,
      pause: noop,
      resume: noop,
      isSpeaking: false,
      isPaused: false,
      currentText: '',
      isSupported: false as const,
    }
  }

  return {
    speak,
    stop,
    pause,
    resume,
    isSpeaking,
    isPaused,
    currentText,
    isSupported: true as const,
  }
}
