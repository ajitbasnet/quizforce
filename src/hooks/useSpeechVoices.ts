import { useEffect, useMemo, useState } from 'react'
import { matchesLangPrefix, resolveLang } from '../utils/voiceLang'
import type { SupportedLanguage } from '../types/quiz'

const isSupported =
  typeof window !== 'undefined' && 'speechSynthesis' in window

export function useSpeechVoices(lang?: SupportedLanguage | string) {
  const [allVoices, setAllVoices] = useState<SpeechSynthesisVoice[]>([])
  const [isLoading, setIsLoading] = useState(isSupported)

  useEffect(() => {
    if (!isSupported) {
      setIsLoading(false)
      return
    }

    const syncVoices = () => {
      const list = window.speechSynthesis.getVoices()
      setAllVoices(list)
      if (list.length > 0) {
        setIsLoading(false)
      }
    }

    const onVoicesChanged = () => {
      const list = window.speechSynthesis.getVoices()
      setAllVoices(list)
      setIsLoading(false)
    }

    syncVoices()
    window.speechSynthesis.addEventListener('voiceschanged', onVoicesChanged)
    return () => {
      window.speechSynthesis.removeEventListener('voiceschanged', onVoicesChanged)
    }
  }, [])

  const voices = useMemo(() => {
    const targetLang = resolveLang(lang)
    return allVoices.filter((voice) => matchesLangPrefix(voice.lang, targetLang))
  }, [allVoices, lang])

  return { voices, isLoading }
}
