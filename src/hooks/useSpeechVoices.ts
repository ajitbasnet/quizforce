import { useEffect, useMemo, useState } from 'react'
import { matchesLangPrefix, resolveLang } from '../utils/voiceLang'
import { isSpeechSupported } from '../utils/speechSupport'
import type { SupportedLanguage } from '../types/quiz'

const MAX_VOICE_RETRIES = 3
const VOICE_RETRY_DELAY_MS = 500

export function useSpeechVoices(lang?: SupportedLanguage | string) {
  const [allVoices, setAllVoices] = useState<SpeechSynthesisVoice[]>([])
  const [isLoading, setIsLoading] = useState(isSpeechSupported())

  useEffect(() => {
    if (!isSpeechSupported()) {
      setIsLoading(false)
      return
    }

    let retryCount = 0
    let retryTimer: ReturnType<typeof setTimeout> | undefined

    const syncVoices = () => {
      const list = window.speechSynthesis.getVoices()
      setAllVoices(list)
      if (list.length > 0) {
        setIsLoading(false)
        return
      }

      if (retryCount < MAX_VOICE_RETRIES) {
        retryCount += 1
        retryTimer = setTimeout(syncVoices, VOICE_RETRY_DELAY_MS)
      } else {
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
      if (retryTimer !== undefined) clearTimeout(retryTimer)
      window.speechSynthesis.removeEventListener('voiceschanged', onVoicesChanged)
    }
  }, [])

  const voices = useMemo(() => {
    const targetLang = resolveLang(lang)
    return allVoices.filter((voice) => matchesLangPrefix(voice.lang, targetLang))
  }, [allVoices, lang])

  return { voices, isLoading }
}
