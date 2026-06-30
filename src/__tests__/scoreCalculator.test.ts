import { describe, expect, it } from 'vitest'
import { calculateScore } from '../utils/scoreCalculator'
import { makeQuiz } from './fixtures/quiz'

describe('calculateScore', () => {
  it('scores all correct answers', () => {
    const quiz = makeQuiz()
    const answers = { q1: 'q1-a', q2: 'q2-b', q3: 'q3-a' }

    const attempt = calculateScore(quiz, answers, {}, 120)

    expect(attempt.score).toBe(30)
    expect(attempt.totalPoints).toBe(30)
    expect(attempt.percentage).toBe(100)
    expect(attempt.feedback.every((f) => f.isCorrect)).toBe(true)
    expect(attempt.timeTaken).toBe(120)
    expect(attempt.quizId).toBe('quiz-1')
    expect(attempt.id).toBeTruthy()
  })

  it('scores all wrong answers', () => {
    const quiz = makeQuiz()
    const answers = { q1: 'q1-b', q2: 'q2-a', q3: 'q3-b' }

    const attempt = calculateScore(quiz, answers, {}, 60)

    expect(attempt.score).toBe(0)
    expect(attempt.percentage).toBe(0)
    expect(attempt.feedback.every((f) => !f.isCorrect)).toBe(true)
    expect(attempt.feedback[0].explanation).toBe('B is wrong.')
  })

  it('scores mixed correct and incorrect answers', () => {
    const quiz = makeQuiz()
    const answers = { q1: 'q1-a', q2: 'q2-a', q3: 'q3-b' }

    const attempt = calculateScore(quiz, answers, {}, 90)

    expect(attempt.score).toBe(10)
    expect(attempt.percentage).toBeCloseTo(33.3, 1)
    expect(attempt.feedback.filter((f) => f.isCorrect)).toHaveLength(1)
    expect(attempt.feedback.find((f) => f.questionId === 'q2')?.explanation).toBe(
      'A is wrong.',
    )
  })

  it('uses custom points from customPointsMap', () => {
    const quiz = makeQuiz()
    const answers = { q1: 'q1-a', q2: 'q2-b', q3: 'q3-a' }
    const customPointsMap = { q1: 20, q2: 5, q3: 15 }

    const attempt = calculateScore(quiz, answers, customPointsMap, 45)

    expect(attempt.score).toBe(40)
    expect(attempt.totalPoints).toBe(40)
    expect(attempt.percentage).toBe(100)
    expect(attempt.feedback.find((f) => f.questionId === 'q1')?.pointsAwarded).toBe(
      20,
    )
  })
})
