import { useCallback, useEffect, useRef, useState } from 'react'
import { isMobileDevice } from '../utils/isMobileDevice'

export const IOS_VOICE_HINT_DISMISSED_KEY = 'quizforge:ios-voice-hint-dismissed'

function isHintDismissed(): boolean {
  try {
    return sessionStorage.getItem(IOS_VOICE_HINT_DISMISSED_KEY) === 'true'
  } catch {
    return false
  }
}

function markHintDismissed(): void {
  try {
    sessionStorage.setItem(IOS_VOICE_HINT_DISMISSED_KEY, 'true')
  } catch {
    // ignore storage errors
  }
}

export function useIosVoiceGestureHint(voiceEnabled: boolean) {
  const [showHint, setShowHint] = useState(false)
  const prevVoiceEnabled = useRef(voiceEnabled)

  useEffect(() => {
    const wasEnabled = prevVoiceEnabled.current
    prevVoiceEnabled.current = voiceEnabled

    if (
      voiceEnabled &&
      !wasEnabled &&
      isMobileDevice() &&
      !isHintDismissed()
    ) {
      setShowHint(true)
    }
  }, [voiceEnabled])

  const dismissHint = useCallback(() => {
    markHintDismissed()
    setShowHint(false)
  }, [])

  useEffect(() => {
    if (!showHint) return

    const onPointerDown = () => dismissHint()
    document.addEventListener('pointerdown', onPointerDown, { once: true })
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [showHint, dismissHint])

  return { showHint, dismissHint }
}
