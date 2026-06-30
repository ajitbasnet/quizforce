import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { useQuizNavigation } from '../hooks/useQuizNavigation'
import { useQuizStore } from '../store/quizStore'
import { makeQuiz } from './fixtures/quiz'

describe('useQuizNavigation', () => {
  it('navigates between questions and tracks answers', () => {
    const quiz = makeQuiz()
    useQuizStore.setState({
      currentQuiz: quiz,
      userAnswers: { q1: 'q1-a' },
    })

    const { result } = renderHook(() => useQuizNavigation())

    expect(result.current.totalQuestions).toBe(3)
    expect(result.current.isAnswered(0)).toBe(true)
    expect(result.current.isCurrent(0)).toBe(true)

    act(() => {
      result.current.navigate('next')
    })
    expect(result.current.currentQuestionIndex).toBe(1)

    act(() => {
      result.current.jumpTo(2)
    })
    expect(result.current.currentQuestionIndex).toBe(2)
    expect(result.current.canGoNext).toBe(false)
  })
})
