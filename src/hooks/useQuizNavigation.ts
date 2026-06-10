import { useCallback, useEffect, useState } from 'react'
import { useQuizStore } from '../store/quizStore'

export function useQuizNavigation() {
  const currentQuiz = useQuizStore((s) => s.currentQuiz)
  const userAnswers = useQuizStore((s) => s.userAnswers)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)

  useEffect(() => {
    setCurrentQuestionIndex(0)
  }, [currentQuiz?.id])

  const totalQuestions = currentQuiz?.questions.length ?? 0
  const canGoPrev = currentQuestionIndex > 0
  const canGoNext = currentQuestionIndex < totalQuestions - 1

  const navigate = useCallback(
    (direction: 'prev' | 'next') => {
      setCurrentQuestionIndex((index) => {
        if (direction === 'prev') return Math.max(0, index - 1)
        return Math.min(totalQuestions - 1, index + 1)
      })
    },
    [totalQuestions],
  )

  const jumpTo = useCallback(
    (index: number) => {
      setCurrentQuestionIndex(
        Math.min(totalQuestions - 1, Math.max(0, index)),
      )
    },
    [totalQuestions],
  )

  const isAnswered = useCallback(
    (index: number) => {
      if (!currentQuiz) return false
      const question = currentQuiz.questions[index]
      if (!question) return false
      return !!userAnswers[question.id]
    },
    [currentQuiz, userAnswers],
  )

  const isCurrent = useCallback(
    (index: number) => index === currentQuestionIndex,
    [currentQuestionIndex],
  )

  return {
    currentQuestionIndex,
    totalQuestions,
    navigate,
    jumpTo,
    canGoNext,
    canGoPrev,
    isAnswered,
    isCurrent,
  }
}
