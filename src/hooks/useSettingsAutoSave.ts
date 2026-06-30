import { useCallback, useEffect, useRef, useState } from 'react'
import { useSettingsStore } from '../store/settingsStore'
import type { QuizSettings } from '../types/quiz'

const SAVED_DURATION_MS = 1500

export function useSettingsAutoSave() {
  const updateSettings = useSettingsStore((s) => s.updateSettings)
  const [saved, setSaved] = useState(false)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [])

  const markSaved = useCallback(() => {
    setSaved(true)
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => setSaved(false), SAVED_DURATION_MS)
  }, [])

  const save = useCallback(
    (partial: Partial<QuizSettings>) => {
      updateSettings(partial)
      markSaved()
    },
    [updateSettings, markSaved],
  )

  return { saved, save, markSaved }
}
