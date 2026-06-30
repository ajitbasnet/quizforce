import { describe, expect, it } from 'vitest'
import { getScoreBreakdown } from '../utils/scoreBreakdown'
import { makeAttempt, makeQuiz } from './fixtures/quiz'

describe('getScoreBreakdown', () => {
  it('computes correct and incorrect counts', () => {
    const quiz = makeQuiz()
    const attempt = makeAttempt(quiz)
    const breakdown = getScoreBreakdown(quiz, attempt)

    expect(breakdown.correctCount).toBe(1)
    expect(breakdown.incorrectCount).toBe(2)
    expect(breakdown.correctPoints).toBe(10)
  })

  it('shows difficulty table for mixed quizzes', () => {
    const quiz = makeQuiz()
    const attempt = makeAttempt(quiz)
    const breakdown = getScoreBreakdown(quiz, attempt)

    expect(breakdown.showDifficultyTable).toBe(true)
    expect(breakdown.difficultyRows).toHaveLength(3)
    expect(breakdown.difficultyRows[0]).toMatchObject({
      difficulty: 'easy',
      total: 1,
    })
  })
})
