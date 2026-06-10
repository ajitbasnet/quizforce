import { useCallback, useRef, useState } from 'react'
import type { SupportedLanguage } from '../types/quiz'

export interface SpeakOptions {
  rate?: number
  pitch?: number
  lang?: SupportedLanguage
}

const LANG_MAP: Record<SupportedLanguage, string> = {
  en: 'en-US',
  es: 'es-ES',
  fr: 'fr-FR',
  hi: 'hi-IN',
  ne: 'ne-NP',
  de: 'de-DE',
  zh: 'zh-CN',
}

export const isVoiceSupported =
  typeof window !== 'undefined' && 'speechSynthesis' in window

export function useVoice() {
  const [isPlaying, setIsPlaying] = useState(false)
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)

  const cancel = useCallback(() => {
    if (!isVoiceSupported) return
    window.speechSynthesis.cancel()
    utteranceRef.current = null
    setIsPlaying(false)
  }, [])

  const speak = useCallback(
    (text: string, options: SpeakOptions = {}) => {
      if (!isVoiceSupported || !text.trim()) return

      window.speechSynthesis.cancel()
      utteranceRef.current = null
      setIsPlaying(false)

      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = options.rate ?? 1
      utterance.pitch = options.pitch ?? 1
      if (options.lang) {
        utterance.lang = LANG_MAP[options.lang]
      }

      utterance.onstart = () => setIsPlaying(true)
      utterance.onend = () => {
        if (utteranceRef.current === utterance) {
          utteranceRef.current = null
          setIsPlaying(false)
        }
      }
      utterance.onerror = () => {
        if (utteranceRef.current === utterance) {
          utteranceRef.current = null
          setIsPlaying(false)
        }
      }

      utteranceRef.current = utterance
      window.speechSynthesis.speak(utterance)
    },
    [],
  )

  return { speak, cancel, isPlaying, isSupported: isVoiceSupported }
}
