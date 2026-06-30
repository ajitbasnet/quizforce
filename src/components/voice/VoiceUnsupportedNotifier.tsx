import { useEffect } from 'react'
import { useLanguage } from '../../hooks/useLanguage'
import { isSpeechSupported } from '../../utils/speechSupport'
import { useToast } from '../ui/Toast'

const SESSION_KEY = 'quizforge:voice-unsupported-toast'

export function VoiceUnsupportedNotifier() {
  const { t } = useLanguage()
  const { toast } = useToast()

  useEffect(() => {
    if (isSpeechSupported()) return
    if (sessionStorage.getItem(SESSION_KEY)) return

    sessionStorage.setItem(SESSION_KEY, '1')
    toast.info(t('voice.unsupportedBrowser'))
  }, [t, toast])

  return null
}
