import { useCallback, useEffect, useRef, useState } from 'react'
import {
  buildQuestionReviewScrollSpeech,
  buildResultsIntroSpeech,
} from '../utils/buildResultsSpeech'
import type { Quiz, QuizAttempt } from '../types/quiz'
import { useLanguage } from './useLanguage'
import { useVoice } from './useVoice'

interface UseResultsVoiceReadingOptions {
  attempt: QuizAttempt | undefined
  quiz: Quiz | undefined
  voiceEnabled: boolean
}

function isElementHalfVisible(el: HTMLElement): boolean {
  const rect = el.getBoundingClientRect()
  const windowHeight =
    window.innerHeight || document.documentElement.clientHeight
  const visibleHeight =
    Math.min(rect.bottom, windowHeight) - Math.max(rect.top, 0)
  return visibleHeight >= rect.height * 0.5
}

export function useResultsVoiceReading({
  attempt,
  quiz,
  voiceEnabled,
}: UseResultsVoiceReadingOptions) {
  const { t } = useLanguage()
  const { speakSequence, stop, isSpeaking } = useVoice()

  const [isResultsReading, setIsResultsReading] = useState(false)
  const [scrollReadingEnabled, setScrollReadingEnabled] = useState(false)

  const spokenQuestionIdsRef = useRef<Set<string>>(new Set())
  const cardElementsRef = useRef<Map<string, HTMLElement>>(new Map())
  const observerRef = useRef<IntersectionObserver | null>(null)
  const wasSpeakingRef = useRef(false)
  const isSpeakingRef = useRef(isSpeaking)

  isSpeakingRef.current = isSpeaking

  const speakCard = useCallback(
    (questionId: string) => {
      if (!quiz || !attempt) return

      const question = quiz.questions.find((q) => q.id === questionId)
      const feedback = attempt.feedback.find((f) => f.questionId === questionId)
      if (!question || !feedback) return

      speakSequence(
        buildQuestionReviewScrollSpeech(question, feedback, t),
        quiz.language,
      )
    },
    [attempt, quiz, speakSequence, t],
  )

  const trySpeakNextVisibleCard = useCallback(() => {
    if (
      !scrollReadingEnabled ||
      !isResultsReading ||
      isSpeakingRef.current
    ) {
      return
    }

    for (const [questionId, el] of cardElementsRef.current) {
      if (spokenQuestionIdsRef.current.has(questionId)) continue
      if (!isElementHalfVisible(el)) continue

      spokenQuestionIdsRef.current.add(questionId)
      speakCard(questionId)
      return
    }
  }, [isResultsReading, scrollReadingEnabled, speakCard])

  const disconnectObserver = useCallback(() => {
    observerRef.current?.disconnect()
    observerRef.current = null
  }, [])

  const stopReading = useCallback(() => {
    stop()
    setIsResultsReading(false)
    setScrollReadingEnabled(false)
    spokenQuestionIdsRef.current.clear()
    disconnectObserver()
  }, [disconnectObserver, stop])

  const startReading = useCallback(() => {
    if (!voiceEnabled || !attempt || !quiz) return

    spokenQuestionIdsRef.current.clear()
    setScrollReadingEnabled(false)
    setIsResultsReading(true)
    speakSequence(buildResultsIntroSpeech(attempt, t), quiz.language)
  }, [attempt, quiz, speakSequence, t, voiceEnabled])

  const registerCardRef = useCallback(
    (questionId: string, el: HTMLElement | null) => {
      const existing = cardElementsRef.current.get(questionId)
      if (existing && observerRef.current) {
        observerRef.current.unobserve(existing)
      }

      if (el) {
        cardElementsRef.current.set(questionId, el)
        observerRef.current?.observe(el)
      } else {
        cardElementsRef.current.delete(questionId)
      }
    },
    [],
  )

  useEffect(() => {
    const wasSpeaking = wasSpeakingRef.current

    if (wasSpeaking && !isSpeaking && isResultsReading) {
      if (!scrollReadingEnabled) {
        setScrollReadingEnabled(true)
      } else {
        trySpeakNextVisibleCard()
      }
    }

    wasSpeakingRef.current = isSpeaking
  }, [
    isSpeaking,
    isResultsReading,
    scrollReadingEnabled,
    trySpeakNextVisibleCard,
  ])

  useEffect(() => {
    if (!scrollReadingEnabled || !voiceEnabled || !isResultsReading) {
      disconnectObserver()
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue

          const questionId = [...cardElementsRef.current.entries()].find(
            ([, el]) => el === entry.target,
          )?.[0]
          if (!questionId) continue
          if (spokenQuestionIdsRef.current.has(questionId)) continue
          if (isSpeakingRef.current) continue

          spokenQuestionIdsRef.current.add(questionId)
          speakCard(questionId)
          return
        }
      },
      { threshold: 0.5 },
    )

    cardElementsRef.current.forEach((el) => observer.observe(el))
    observerRef.current = observer

    return () => {
      observer.disconnect()
      if (observerRef.current === observer) {
        observerRef.current = null
      }
    }
  }, [
    disconnectObserver,
    isResultsReading,
    scrollReadingEnabled,
    speakCard,
    voiceEnabled,
  ])

  useEffect(() => {
    if (scrollReadingEnabled && isResultsReading) {
      trySpeakNextVisibleCard()
    }
  }, [isResultsReading, scrollReadingEnabled, trySpeakNextVisibleCard])

  useEffect(() => {
    if (isResultsReading && !voiceEnabled) {
      stopReading()
    }
  }, [isResultsReading, stopReading, voiceEnabled])

  useEffect(() => {
    return () => {
      stop()
      disconnectObserver()
    }
  }, [disconnectObserver, stop])

  return {
    isResultsReading,
    startReading,
    stopReading,
    registerCardRef,
  }
}
