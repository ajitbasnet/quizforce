import { useEffect } from 'react'
import { isSpeechSupported } from '../utils/speechSupport'
import { useVoice } from './useVoice'

export function useSpeechCleanup() {
  const { stop } = useVoice()

  useEffect(
    () => () => {
      stop()
      if (isSpeechSupported()) {
        window.speechSynthesis.cancel()
      }
    },
    [stop],
  )
}
