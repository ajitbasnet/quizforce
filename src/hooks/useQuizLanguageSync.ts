import { useEffect, useRef, useState } from 'react'
import { translateQuiz } from '../api/translateQuiz'
import { useSettingsStore } from '../store/settingsStore'
import { QuizGenerationError } from '../types/api'
import type { Quiz, QuizAttempt, SupportedLanguage } from '../types/quiz'
import { rebuildAttemptFeedback } from '../utils/rebuildAttemptFeedback'
import { syncVoiceForLanguage } from '../utils/syncVoiceForLanguage'

const DEBOUNCE_MS = 300
const CACHE_PREFIX = 'quizforge:translation:'

function translationCacheKey(quizId: string, targetLang: SupportedLanguage): string {
  return `${CACHE_PREFIX}${quizId}:${targetLang}`
}

function readCachedQuiz(cacheKey: string): Quiz | null {
  try {
    const raw = sessionStorage.getItem(cacheKey)
    if (!raw) return null
    return JSON.parse(raw) as Quiz
  } catch {
    sessionStorage.removeItem(cacheKey)
    return null
  }
}

function applyTranslation(
  quiz: Quiz,
  translated: Quiz,
  targetLanguage: SupportedLanguage,
): Quiz {
  return {
    ...translated,
    settings: { ...quiz.settings, language: targetLanguage },
  }
}

interface UseQuizLanguageSyncOptions {
  quiz: Quiz | null | undefined
  attempt?: QuizAttempt | null
  onQuizUpdate: (quiz: Quiz) => void
  onAttemptUpdate?: (attempt: QuizAttempt) => void
}

export function useQuizLanguageSync({
  quiz,
  attempt,
  onQuizUpdate,
  onAttemptUpdate,
}: UseQuizLanguageSyncOptions) {
  const settingsLanguage = useSettingsStore((s) => s.settings.language)
  const [isTranslating, setIsTranslating] = useState(false)
  const [translateError, setTranslateError] = useState<string | null>(null)

  const abortRef = useRef<AbortController | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const latestLangRef = useRef(settingsLanguage)
  const onQuizUpdateRef = useRef(onQuizUpdate)
  const onAttemptUpdateRef = useRef(onAttemptUpdate)
  const attemptRef = useRef(attempt)

  onQuizUpdateRef.current = onQuizUpdate
  onAttemptUpdateRef.current = onAttemptUpdate
  attemptRef.current = attempt

  useEffect(() => {
    latestLangRef.current = settingsLanguage

    if (!quiz || settingsLanguage === quiz.language) {
      setIsTranslating(false)
      setTranslateError(null)
      return
    }

    const targetLanguage = settingsLanguage
    const sourceQuiz = quiz

    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    debounceRef.current = setTimeout(() => {
      void (async () => {
        if (latestLangRef.current !== targetLanguage) return

        const cacheKey = translationCacheKey(sourceQuiz.id, targetLanguage)
        const cached = readCachedQuiz(cacheKey)

        if (cached) {
          const merged = applyTranslation(sourceQuiz, cached, targetLanguage)
          onQuizUpdateRef.current(merged)
          const currentAttempt = attemptRef.current
          if (currentAttempt && onAttemptUpdateRef.current) {
            onAttemptUpdateRef.current(rebuildAttemptFeedback(merged, currentAttempt))
          }
          syncVoiceForLanguage(targetLanguage)
          return
        }

        abortRef.current?.abort()
        const controller = new AbortController()
        abortRef.current = controller

        setIsTranslating(true)
        setTranslateError(null)

        try {
          const translated = await translateQuiz(
            sourceQuiz,
            targetLanguage,
            controller.signal,
          )

          if (latestLangRef.current !== targetLanguage) return

          const merged = applyTranslation(sourceQuiz, translated, targetLanguage)
          sessionStorage.setItem(cacheKey, JSON.stringify(merged))

          onQuizUpdateRef.current(merged)

          const currentAttempt = attemptRef.current
          if (currentAttempt && onAttemptUpdateRef.current) {
            onAttemptUpdateRef.current(rebuildAttemptFeedback(merged, currentAttempt))
          }

          syncVoiceForLanguage(targetLanguage)
        } catch (error) {
          if (latestLangRef.current !== targetLanguage) return
          if (error instanceof QuizGenerationError && error.code === 'ABORTED') {
            return
          }

          const message =
            error instanceof QuizGenerationError
              ? error.message
              : error instanceof Error
                ? error.message
                : 'Translation failed'
          setTranslateError(message)
        } finally {
          if (latestLangRef.current === targetLanguage) {
            setIsTranslating(false)
          }
        }
      })()
    }, DEBOUNCE_MS)

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
        debounceRef.current = null
      }
      abortRef.current?.abort()
    }
  }, [quiz, settingsLanguage])

  return { isTranslating, translateError }
}
